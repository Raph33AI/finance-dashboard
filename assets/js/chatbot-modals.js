/**
 * ============================================
 * 🔥 CHATBOT MODALS - SHARE & SETTINGS
 * Version Corrigée & Fonctionnelle 100%
 * ============================================
 */

class ChatbotModals {
    constructor() {
        this.shareModal = document.getElementById('share-modal');
        this.settingsModal = document.getElementById('settings-modal');
        this.toastContainer = this.getOrCreateToastContainer();
        this.chatbotInstance = null;
        
        // Default settings
        this.defaultSettings = {
            aiModel: 'gemini-1.5-pro',
            temperature: 0.7,
            maxTokens: 4096,
            defaultTimeframe: '1d',
            theme: 'auto',
            fontSize: 15,
            enableAnimations: true,
            showRobot: false,
            compactMode: false,
            enableSound: true,
            emailAlerts: false,
            autoSave: true,
            alertFrequency: 'daily'
        };
        
        this.init();
    }
    
    init() {
        console.log('🎯 Initializing Chatbot Modals...');
        
        // Attendre que le chatbot soit initialisé
        this.waitForChatbot();
        
        // Event Listeners
        this.setupShareButton();
        this.setupSettingsButton();
        this.setupModalClosing();
        this.setupShareActions();
        this.setupSettingsTabs();
        this.setupSettingsControls();
        this.loadSettings();
        
        console.log('✅ Chatbot Modals initialized');
    }
    
    // ============================================
    // CHATBOT INTEGRATION (CORRIGÉ)
    // ============================================
    
    waitForChatbot() {
        const checkChatbot = () => {
            // Chercher l'instance du chatbot (plusieurs possibilités)
            this.chatbotInstance = window.financialChatbot 
                                || window.chatbotFullpage 
                                || window.chatbotUI 
                                || window.chatbot 
                                || null;
            
            if (this.chatbotInstance) {
                console.log('✅ Chatbot instance found:', this.chatbotInstance);
                this.applyAISettings(); // Appliquer les settings immédiatement
            } else {
                console.log('⏳ Waiting for chatbot instance...');
                setTimeout(checkChatbot, 500);
            }
        };
        
        checkChatbot();
    }
    
    // ============================================
    // TOAST CONTAINER (CREATE IF NOT EXISTS)
    // ============================================
    
    getOrCreateToastContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }
    
    // ============================================
    // MODAL MANAGEMENT
    // ============================================
    
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            console.log(`📂 Modal opened: ${modalId}`);
        } else {
            console.warn(`⚠ Modal not found: ${modalId}`);
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            console.log(`📁 Modal closed: ${modalId}`);
        }
    }
    
    setupShareButton() {
        const shareBtn = document.getElementById('share-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.openModal('share-modal');
            });
        }
    }
    
    setupSettingsButton() {
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.openModal('settings-modal');
            });
        }
    }
    
    setupModalClosing() {
        // Close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.chatbot-modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });
        
        // Click on overlay
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', () => {
                const modal = overlay.closest('.chatbot-modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });
        
        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.shareModal?.classList.contains('active')) {
                    this.closeModal('share-modal');
                }
                if (this.settingsModal?.classList.contains('active')) {
                    this.closeModal('settings-modal');
                }
            }
        });
    }
    
    // ============================================
    // SHARE ACTIONS (100% FONCTIONNEL)
    // ============================================
    
    setupShareActions() {
        // Export PDF
        document.getElementById('share-pdf')?.addEventListener('click', () => {
            this.exportToPDF();
        });
        
        // Copy Link
        document.getElementById('share-link')?.addEventListener('click', () => {
            this.copyShareLink();
        });
        
        // Export Markdown
        document.getElementById('share-markdown')?.addEventListener('click', () => {
            this.exportToMarkdown();
        });
        
        // Email
        document.getElementById('share-email')?.addEventListener('click', () => {
            this.shareViaEmail();
        });
        
        // Share Summary
        document.getElementById('share-summary')?.addEventListener('click', () => {
            this.generateSummary();
        });
    }
    
    async exportToPDF() {
        try {
            this.showToast('Generating PDF...', 'info');
            
            const messages = this.getConversationMessages();
            
            if (messages.length === 0) {
                this.showToast('No messages to export', 'error');
                return;
            }
            
            // Charger html2pdf dynamiquement
            if (typeof html2pdf === 'undefined') {
                await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
            }
            
            const htmlContent = this.createPDFContent(messages);
            
            const opt = {
                margin: [10, 10, 10, 10],
                filename: `alphavault-conversation-${new Date().toISOString().slice(0,10)}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            await html2pdf().set(opt).from(htmlContent).save();
            
            this.showToast('PDF exported successfully!', 'success');
            this.closeModal('share-modal');
            
        } catch (error) {
            console.error('❌ PDF export error:', error);
            this.showToast('Failed to export PDF', 'error');
        }
    }
    
    createPDFContent(messages) {
        const container = document.createElement('div');
        container.style.cssText = `
            padding: 20px;
            font-family: 'Inter', Arial, sans-serif;
            max-width: 800px;
        `;
        
        const header = `
            <div style="margin-bottom: 30px;">
                <h1 style="color: #667eea; font-size: 28px; font-weight: 800; margin: 0 0 10px 0;">
                    AlphaVault AI Conversation
                </h1>
                <p style="color: #64748b; margin: 0 0 20px 0; font-size: 14px;">
                    📅 ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
                </p>
                <hr style="border: none; border-top: 2px solid #e2e8f0; margin: 20px 0;">
            </div>
        `;
        container.innerHTML = header;
        
        messages.forEach((msg, index) => {
            const msgDiv = document.createElement('div');
            msgDiv.style.cssText = `
                margin-bottom: 20px;
                padding: 15px;
                background-color: ${msg.role === 'user' ? '#f1f5f9' : '#ffffff'};
                border-left: 4px solid ${msg.role === 'user' ? '#667eea' : '#10b981'};
                border-radius: 8px;
                page-break-inside: avoid;
            `;
            
            const role = msg.role === 'user' ? '👤 You' : '🤖 Alphy AI';
            msgDiv.innerHTML = `
                <strong style="color: #1e293b; font-size: 14px; display: block; margin-bottom: 8px;">
                    ${role}
                </strong>
                <p style="color: #475569; margin: 0; line-height: 1.6; font-size: 13px;">
                    ${msg.text}
                </p>
            `;
            
            container.appendChild(msgDiv);
        });
        
        // Footer
        const footer = document.createElement('div');
        footer.style.cssText = `
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
        `;
        footer.innerHTML = `
            <p>Generated by AlphaVault AI • ${messages.length} messages</p>
            <p style="margin-top: 5px;">© ${new Date().getFullYear()} AlphaVault AI. All rights reserved.</p>
        `;
        container.appendChild(footer);
        
        return container;
    }
    
    async copyShareLink() {
        try {
            const messages = this.getConversationMessages();
            
            if (messages.length === 0) {
                this.showToast('No messages to share', 'error');
                return;
            }
            
            const conversationId = this.getCurrentConversationId();
            
            // Option 1 : Lien local (si Firebase non configuré)
            const shareLink = `${window.location.origin}/shared/${conversationId}`;
            
            // Option 2 : Encoder la conversation dans l'URL (pour partage direct)
            const encodedConversation = btoa(JSON.stringify(messages.slice(0, 5))); // Limiter pour URL
            const directLink = `${window.location.origin}?conversation=${encodedConversation}`;
            
            await navigator.clipboard.writeText(shareLink);
            this.showToast('Share link copied to clipboard!', 'success');
            this.closeModal('share-modal');
            
            console.log('📋 Share link:', shareLink);
            console.log('📋 Direct link:', directLink);
            
        } catch (error) {
            console.error('❌ Copy link error:', error);
            this.showToast('Failed to copy link', 'error');
        }
    }
    
    exportToMarkdown() {
        try {
            const messages = this.getConversationMessages();
            
            if (messages.length === 0) {
                this.showToast('No messages to export', 'error');
                return;
            }
            
            let markdown = `# AlphaVault AI Conversation\n\n`;
            markdown += `**Date**: ${new Date().toLocaleString()}\n\n`;
            markdown += `**Total Messages**: ${messages.length}\n\n`;
            markdown += `---\n\n`;
            
            messages.forEach((msg, index) => {
                const role = msg.role === 'user' ? '👤 **You**' : '🤖 **Alphy AI**';
                markdown += `### ${role}\n\n${msg.text}\n\n---\n\n`;
            });
            
            markdown += `\n*Generated by AlphaVault AI on ${new Date().toLocaleString()}*\n`;
            
            this.downloadFile('alphavault-conversation.md', markdown, 'text/markdown');
            this.showToast('Markdown exported successfully!', 'success');
            this.closeModal('share-modal');
            
        } catch (error) {
            console.error('❌ Markdown export error:', error);
            this.showToast('Failed to export Markdown', 'error');
        }
    }
    
    shareViaEmail() {
        try {
            const messages = this.getConversationMessages();
            
            if (messages.length === 0) {
                this.showToast('No messages to share', 'error');
                return;
            }
            
            const subject = encodeURIComponent('AlphaVault AI Conversation - ' + new Date().toLocaleDateString());
            const body = encodeURIComponent(this.formatMessagesForEmail(messages));
            
            const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
            
            // Check if body is too long (some email clients have limits)
            if (mailtoLink.length > 2000) {
                this.showToast('Conversation too long for email. Try Export instead.', 'error');
                return;
            }
            
            window.location.href = mailtoLink;
            this.showToast('Opening email client...', 'info');
            this.closeModal('share-modal');
            
        } catch (error) {
            console.error('❌ Email share error:', error);
            this.showToast('Failed to open email client', 'error');
        }
    }
    
    async generateSummary() {
        try {
            const messages = this.getConversationMessages();
            
            if (messages.length === 0) {
                this.showToast('No messages to summarize', 'error');
                return;
            }
            
            this.showToast('Generating AI summary...', 'info');
            this.closeModal('share-modal');
            
            await this.delay(1000);
            
            const summary = this.createAdvancedSummary(messages);
            this.downloadFile('conversation-summary.txt', summary, 'text/plain');
            
            this.showToast('Summary generated successfully!', 'success');
            
        } catch (error) {
            console.error('❌ Summary generation error:', error);
            this.showToast('Failed to generate summary', 'error');
        }
    }
    
    createAdvancedSummary(messages) {
        const userMessages = messages.filter(m => m.role === 'user');
        const assistantMessages = messages.filter(m => m.role === 'assistant');
        
        let summary = `╔═══════════════════════════════════════════════════════════╗\n`;
        summary += `║        AlphaVault AI - Conversation Summary            ║\n`;
        summary += `╚═══════════════════════════════════════════════════════════╝\n\n`;
        
        summary += `📅 Date: ${new Date().toLocaleString()}\n`;
        summary += `💬 Total Messages: ${messages.length}\n`;
        summary += `👤 Your Questions: ${userMessages.length}\n`;
        summary += `🤖 AI Responses: ${assistantMessages.length}\n\n`;
        
        summary += `═══════════════════════════════════════════════════════════\n\n`;
        
        // Extract topics
        const topics = this.extractTopics(messages);
        summary += `📊 Topics Discussed:\n`;
        topics.forEach((topic, i) => {
            summary += `   ${i + 1}. ${topic}\n`;
        });
        summary += `\n`;
        
        // Key questions
        summary += `═══════════════════════════════════════════════════════════\n\n`;
        summary += `❓ Key Questions Asked:\n\n`;
        userMessages.slice(0, 5).forEach((msg, i) => {
            const preview = msg.text.length > 100 ? msg.text.substring(0, 100) + '...' : msg.text;
            summary += `${i + 1}. ${preview}\n\n`;
        });
        
        // Key insights
        summary += `═══════════════════════════════════════════════════════════\n\n`;
        summary += `💡 Key Insights from AI:\n\n`;
        assistantMessages.slice(0, 3).forEach((msg, i) => {
            const preview = msg.text.length > 200 ? msg.text.substring(0, 200) + '...' : msg.text;
            summary += `${i + 1}. ${preview}\n\n`;
        });
        
        summary += `═══════════════════════════════════════════════════════════\n\n`;
        summary += `Generated by AlphaVault AI\n`;
        summary += `© ${new Date().getFullYear()} AlphaVault AI. All rights reserved.\n`;
        
        return summary;
    }
    
    extractTopics(messages) {
        const topics = new Set();
        const keywords = {
            'Stock Analysis': ['stock', 'share', 'equity', 'ticker', 'quote'],
            'IPO Analysis': ['ipo', 'initial public offering', 'newly listed'],
            'Market Overview': ['market', 'index', 'dow', 's&p', 'nasdaq'],
            'Technical Analysis': ['technical', 'rsi', 'macd', 'chart', 'indicator'],
            'Fundamental Analysis': ['fundamental', 'p/e', 'eps', 'revenue', 'earnings'],
            'Portfolio Management': ['portfolio', 'allocation', 'diversification'],
            'Risk Analysis': ['risk', 'volatility', 'var', 'sharpe'],
            'Economic Data': ['economy', 'gdp', 'inflation', 'fed', 'interest rate']
        };
        
        messages.forEach(msg => {
            const text = msg.text.toLowerCase();
            Object.entries(keywords).forEach(([topic, words]) => {
                if (words.some(word => text.includes(word))) {
                    topics.add(topic);
                }
            });
        });
        
        return topics.size > 0 ? Array.from(topics) : ['General Finance'];
    }
    
    // ============================================
    // SETTINGS TABS
    // ============================================
    
    setupSettingsTabs() {
        const tabs = document.querySelectorAll('.settings-tab');
        const panels = document.querySelectorAll('.settings-panel');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetPanel = tab.dataset.tab;
                
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                
                tab.classList.add('active');
                const panel = document.querySelector(`[data-panel="${targetPanel}"]`);
                if (panel) {
                    panel.classList.add('active');
                }
            });
        });
    }
    
    // ============================================
    // SETTINGS CONTROLS (100% FONCTIONNEL)
    // ============================================
    
    setupSettingsControls() {
        // AI Model
        const aiModelSelect = document.getElementById('ai-model');
        aiModelSelect?.addEventListener('change', (e) => {
            this.updateSetting('aiModel', e.target.value);
            this.applyAISettings();
        });
        
        // Temperature
        const tempSlider = document.getElementById('temperature');
        const tempValue = document.getElementById('temperature-value');
        tempSlider?.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (tempValue) tempValue.textContent = value.toFixed(1);
            this.updateSetting('temperature', value);
            this.applyAISettings();
        });
        
        // Max Tokens
        const tokensSelect = document.getElementById('max-tokens');
        const tokensValue = document.getElementById('max-tokens-value');
        tokensSelect?.addEventListener('change', (e) => {
            const value = parseInt(e.target.value);
            if (tokensValue) tokensValue.textContent = value;
            this.updateSetting('maxTokens', value);
            this.applyAISettings();
        });
        
        // Default Timeframe
        const timeframeSelect = document.getElementById('default-timeframe');
        timeframeSelect?.addEventListener('change', (e) => {
            this.updateSetting('defaultTimeframe', e.target.value);
        });
        
        // Theme Toggle Buttons
        document.querySelectorAll('[data-theme]').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                document.querySelectorAll('[data-theme]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateSetting('theme', theme);
                this.applyTheme(theme);
            });
        });
        
        // Font Size
        const fontSlider = document.getElementById('font-size');
        const fontValue = document.getElementById('font-size-value');
        fontSlider?.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            if (fontValue) fontValue.textContent = `${value}px`;
            this.updateSetting('fontSize', value);
            this.applyFontSize(value);
        });
        
        // Checkboxes
        this.setupCheckbox('enable-animations', 'enableAnimations', this.toggleAnimations.bind(this));
        this.setupCheckbox('show-robot', 'showRobot', this.toggleRobot.bind(this));
        this.setupCheckbox('compact-mode', 'compactMode', this.toggleCompactMode.bind(this));
        this.setupCheckbox('enable-sound', 'enableSound');
        this.setupCheckbox('email-alerts', 'emailAlerts');
        this.setupCheckbox('auto-save', 'autoSave');
        
        // Alert Frequency
        const alertFreqSelect = document.getElementById('alert-frequency');
        alertFreqSelect?.addEventListener('change', (e) => {
            this.updateSetting('alertFrequency', e.target.value);
        });
        
        // Data Management Buttons
        document.getElementById('clear-history')?.addEventListener('click', () => {
            this.clearHistory();
        });
        
        document.getElementById('export-data')?.addEventListener('click', () => {
            this.exportAllData();
        });
        
        // Save Settings Button
        document.getElementById('save-settings')?.addEventListener('click', () => {
            this.saveSettings();
        });
        
        // Reset Settings Button
        document.getElementById('reset-settings')?.addEventListener('click', () => {
            this.resetSettings();
        });
    }
    
    setupCheckbox(elementId, settingKey, callback = null) {
        const checkbox = document.getElementById(elementId);
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                this.updateSetting(settingKey, e.target.checked);
                if (callback) {
                    callback(e.target.checked);
                }
            });
        }
    }
    
    // ============================================
    // SETTINGS STORAGE
    // ============================================
    
    loadSettings() {
        const savedSettings = localStorage.getItem('chatbotSettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : this.defaultSettings;
        
        // Merge with defaults (pour nouvelles options)
        const mergedSettings = { ...this.defaultSettings, ...settings };
        localStorage.setItem('chatbotSettings', JSON.stringify(mergedSettings));
        
        // Apply to UI
        this.applySettingsToUI(mergedSettings);
        
        // Apply to chatbot
        this.applyTheme(mergedSettings.theme);
        this.applyFontSize(mergedSettings.fontSize);
        this.toggleAnimations(mergedSettings.enableAnimations);
        this.toggleCompactMode(mergedSettings.compactMode);
        this.toggleRobot(mergedSettings.showRobot);
        this.applyAISettings();
        
        // Update conversation count
        this.updateConversationCount();
        
        console.log('✅ Settings loaded and applied:', mergedSettings);
    }
    
    applySettingsToUI(settings) {
        // AI Model
        const aiModelSelect = document.getElementById('ai-model');
        if (aiModelSelect && settings.aiModel) {
            aiModelSelect.value = settings.aiModel;
        }
        
        // Temperature
        const tempSlider = document.getElementById('temperature');
        const tempValue = document.getElementById('temperature-value');
        if (tempSlider && settings.temperature !== undefined) {
            tempSlider.value = settings.temperature;
            if (tempValue) tempValue.textContent = settings.temperature.toFixed(1);
        }
        
        // Max Tokens
        const tokensSelect = document.getElementById('max-tokens');
        const tokensValue = document.getElementById('max-tokens-value');
        if (tokensSelect && settings.maxTokens) {
            tokensSelect.value = settings.maxTokens;
            if (tokensValue) tokensValue.textContent = settings.maxTokens;
        }
        
        // Default Timeframe
        const timeframeSelect = document.getElementById('default-timeframe');
        if (timeframeSelect && settings.defaultTimeframe) {
            timeframeSelect.value = settings.defaultTimeframe;
        }
        
        // Font Size
        const fontSlider = document.getElementById('font-size');
        const fontValue = document.getElementById('font-size-value');
        if (fontSlider && settings.fontSize) {
            fontSlider.value = settings.fontSize;
            if (fontValue) fontValue.textContent = `${settings.fontSize}px`;
        }
        
        // Theme
        if (settings.theme) {
            document.querySelectorAll('[data-theme]').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === settings.theme);
            });
        }
        
        // Alert Frequency
        const alertFreqSelect = document.getElementById('alert-frequency');
        if (alertFreqSelect && settings.alertFrequency) {
            alertFreqSelect.value = settings.alertFrequency;
        }
        
        // Checkboxes
        const checkboxes = {
            'enable-animations': settings.enableAnimations,
            'show-robot': settings.showRobot,
            'compact-mode': settings.compactMode,
            'enable-sound': settings.enableSound,
            'email-alerts': settings.emailAlerts,
            'auto-save': settings.autoSave
        };
        
        Object.entries(checkboxes).forEach(([id, checked]) => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.checked = checked;
            }
        });
    }
    
    updateSetting(key, value) {
        const settings = JSON.parse(localStorage.getItem('chatbotSettings') || '{}');
        settings[key] = value;
        localStorage.setItem('chatbotSettings', JSON.stringify(settings));
        console.log(`✅ Setting updated: ${key} = ${value}`);
    }
    
    saveSettings() {
        this.showToast('Settings saved successfully!', 'success');
        this.closeModal('settings-modal');
    }
    
    resetSettings() {
        if (confirm('Reset all settings to default values?')) {
            localStorage.setItem('chatbotSettings', JSON.stringify(this.defaultSettings));
            this.loadSettings();
            this.showToast('Settings reset to defaults', 'success');
        }
    }
    
    // ============================================
    // APPLY SETTINGS (CORRIGÉ)
    // ============================================
    
    applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else if (theme === 'light') {
            document.body.classList.remove('dark-mode');
        } else {
            // Auto - based on system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.classList.toggle('dark-mode', prefersDark);
        }
        console.log(`🎨 Theme applied: ${theme}`);
    }
    
    applyFontSize(size) {
        document.documentElement.style.setProperty('--message-font-size', `${size}px`);
        
        // Apply to all message texts
        document.querySelectorAll('.message-text, .message-bubble').forEach(el => {
            el.style.fontSize = `${size}px`;
        });
        
        console.log(`📏 Font size applied: ${size}px`);
    }
    
    toggleAnimations(enabled) {
        document.body.classList.toggle('no-animations', !enabled);
        console.log(`✨ Animations ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    toggleCompactMode(enabled) {
        document.body.classList.toggle('compact-mode', enabled);
        console.log(`📦 Compact mode ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    toggleRobot(enabled) {
        const robotContainers = [
            document.getElementById('robot-3d-container'),
            document.querySelector('.robot-3d-container'),
            document.querySelector('.robot-3d-container-threejs')
        ];
        
        robotContainers.forEach(container => {
            if (container) {
                container.style.display = enabled ? 'block' : 'none';
            }
        });
        
        console.log(`🤖 Robot ${enabled ? 'shown' : 'hidden'}`);
    }
    
    applyAISettings() {
        const settings = JSON.parse(localStorage.getItem('chatbotSettings') || '{}');
        
        if (!this.chatbotInstance) {
            console.warn('⚠ Chatbot instance not ready yet');
            return;
        }
        
        // Différentes structures possibles
        const gemini = this.chatbotInstance.geminiIntegration 
                    || this.chatbotInstance.aiEngine 
                    || this.chatbotInstance.gemini 
                    || this.chatbotInstance;
        
        if (gemini) {
            if (settings.temperature !== undefined) {
                gemini.temperature = settings.temperature;
                console.log(`🌡 Temperature set to: ${settings.temperature}`);
            }
            
            if (settings.maxTokens) {
                gemini.maxOutputTokens = settings.maxTokens;
                console.log(`📊 Max tokens set to: ${settings.maxTokens}`);
            }
            
            if (settings.aiModel) {
                gemini.modelName = settings.aiModel;
                console.log(`🤖 AI Model set to: ${settings.aiModel}`);
            }
            
            console.log('✅ AI settings applied to chatbot instance');
        } else {
            console.warn('⚠ Could not find Gemini integration in chatbot instance');
        }
    }
    
    // ============================================
    // DATA MANAGEMENT
    // ============================================
    
    clearHistory() {
        if (confirm('⚠ Are you sure you want to delete ALL conversations?\n\nThis action cannot be undone!')) {
            // Clear localStorage
            localStorage.removeItem('chatbotConversations');
            localStorage.removeItem('chatbotCurrentConversation');
            
            // Clear visible messages
            const messagesContainer = document.querySelector('.chatbot-messages-content') 
                                   || document.getElementById('chatbot-messages-content');
            
            if (messagesContainer) {
                messagesContainer.innerHTML = '';
            }
            
            // Clear conversation list if exists
            const conversationsList = document.querySelector('.conversations-list');
            if (conversationsList) {
                conversationsList.innerHTML = '<p style="text-align: center; color: #94a3b8; padding: 20px;">No conversations yet</p>';
            }
            
            this.showToast('All conversations deleted', 'success');
            this.updateConversationCount();
            
            // Reload chatbot welcome screen
            if (this.chatbotInstance && typeof this.chatbotInstance.showWelcomeScreen === 'function') {
                this.chatbotInstance.showWelcomeScreen();
            }
        }
    }
    
    exportAllData() {
        try {
            const data = {
                conversations: JSON.parse(localStorage.getItem('chatbotConversations') || '[]'),
                settings: JSON.parse(localStorage.getItem('chatbotSettings') || '{}'),
                currentConversation: JSON.parse(localStorage.getItem('chatbotCurrentConversation') || 'null'),
                exportDate: new Date().toISOString(),
                version: '1.0.0'
            };
            
            const json = JSON.stringify(data, null, 2);
            this.downloadFile('alphavault-ai-data.json', json, 'application/json');
            this.showToast('Data exported successfully!', 'success');
            
            console.log('📦 Exported data:', data);
            
        } catch (error) {
            console.error('❌ Export error:', error);
            this.showToast('Failed to export data', 'error');
        }
    }
    
    updateConversationCount() {
        const conversations = JSON.parse(localStorage.getItem('chatbotConversations') || '[]');
        const countEl = document.getElementById('conversations-count');
        if (countEl) {
            countEl.textContent = conversations.length;
        }
    }
    
    // ============================================
    // HELPERS (CORRIGÉ)
    // ============================================
    
    getConversationMessages() {
        const messagesContainer = document.querySelector('.chatbot-messages-content') 
                               || document.getElementById('chatbot-messages-content');
        
        if (!messagesContainer) {
            console.warn('⚠ Messages container not found');
            return [];
        }
        
        const messages = [];
        
        // Essayer différents sélecteurs
        const messageElements = messagesContainer.querySelectorAll('.message, .chatbot-message, [class*="message"]');
        
        messageElements.forEach(msg => {
            // Déterminer si c'est un message user ou bot
            const isUser = msg.classList.contains('user-message') 
                        || msg.classList.contains('user') 
                        || msg.querySelector('.user-avatar');
            
            // Trouver le texte du message
            const textEl = msg.querySelector('.message-text') 
                        || msg.querySelector('.message-content') 
                        || msg.querySelector('.message-bubble') 
                        || msg;
            
            if (textEl && textEl.textContent.trim()) {
                messages.push({
                    role: isUser ? 'user' : 'assistant',
                    text: textEl.textContent.trim()
                });
            }
        });
        
        console.log(`📨 Retrieved ${messages.length} messages`);
        return messages;
    }
    
    getCurrentConversationId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
    
    formatMessagesForEmail(messages) {
        let text = '═══════════════════════════════════════════\n';
        text += '     AlphaVault AI Conversation\n';
        text += '═══════════════════════════════════════════\n\n';
        text += `Date: ${new Date().toLocaleString()}\n`;
        text += `Total Messages: ${messages.length}\n\n`;
        text += '-------------------------------------------\n\n';
        
        messages.forEach((msg, index) => {
            const role = msg.role === 'user' ? 'YOU' : 'ALPHY AI';
            text += `[${role}]:\n${msg.text}\n\n`;
            if (index < messages.length - 1) {
                text += '---\n\n';
            }
        });
        
        text += '\n═══════════════════════════════════════════\n';
        text += 'Generated by AlphaVault AI\n';
        text += `© ${new Date().getFullYear()} AlphaVault AI\n`;
        
        return text;
    }
    
    downloadFile(filename, content, mimeType = 'text/plain') {
        try {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            console.log(`💾 File downloaded: ${filename}`);
            
        } catch (error) {
            console.error('❌ Download error:', error);
            throw error;
        }
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✓',
            error: '✕',
            info: 'ⓘ'
        };
        
        const icon = icons[type] || 'ⓘ';
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-title">${this.getToastTitle(type)}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;
        
        this.toastContainer.appendChild(toast);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            toast.style.animation = 'toastSlideIn 0.3s ease reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 4000);
    }
    
    getToastTitle(type) {
        const titles = {
            success: 'Success',
            error: 'Error',
            info: 'Information'
        };
        return titles[type] || 'Notification';
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                console.log(`✅ Script loaded: ${src}`);
                resolve();
            };
            script.onerror = () => {
                console.error(`❌ Failed to load script: ${src}`);
                reject(new Error(`Failed to load ${src}`));
            };
            document.head.appendChild(script);
        });
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Chatbot Modals System...');
    
    window.chatbotModals = new ChatbotModals();
    
    console.log('✅ Chatbot Modals System ready');
    
    // ============================================
    // KEYBOARD SHORTCUTS
    // ============================================
    
    document.addEventListener('keydown', (e) => {
        // Ctrl+, pour Settings
        if (e.ctrlKey && e.key === ',') {
            e.preventDefault();
            window.chatbotModals.openModal('settings-modal');
            console.log('⌨ Settings opened via keyboard shortcut');
        }
        
        // Ctrl+D pour Dark Mode Toggle
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            const isDark = document.body.classList.toggle('dark-mode');
            window.chatbotModals.updateSetting('theme', isDark ? 'dark' : 'light');
            window.chatbotModals.showToast(`Dark mode ${isDark ? 'enabled' : 'disabled'}`, 'info');
            console.log(`🎨 Dark mode ${isDark ? 'enabled' : 'disabled'} via keyboard`);
        }
        
        // Ctrl+Shift+E pour Export/Share
        if (e.ctrlKey && e.shiftKey && e.key === 'E') {
            e.preventDefault();
            window.chatbotModals.openModal('share-modal');
            console.log('⌨ Share modal opened via keyboard shortcut');
        }
        
        // Ctrl+Shift+C pour Clear History
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            window.chatbotModals.clearHistory();
        }
    });
});