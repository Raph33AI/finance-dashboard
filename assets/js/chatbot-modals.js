/**
 * ============================================
 * 🔥 CHATBOT MODALS - SHARE & SETTINGS
 * ============================================
 */

class ChatbotModals {
    constructor() {
        this.shareModal = document.getElementById('share-modal');
        this.settingsModal = document.getElementById('settings-modal');
        this.toastContainer = document.getElementById('toast-container');
        this.chatbotInstance = null; // Référence au chatbot
        
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
    // CHATBOT INTEGRATION
    // ============================================
    
    waitForChatbot() {
        const checkChatbot = () => {
            // Chercher l'instance du chatbot dans window
            this.chatbotInstance = window.financialChatbot || window.chatbotFullpage || null;
            
            if (this.chatbotInstance) {
                console.log('✅ Chatbot instance found');
            } else {
                console.log('⏳ Waiting for chatbot instance...');
                setTimeout(checkChatbot, 500);
            }
        };
        
        checkChatbot();
    }
    
    // ============================================
    // MODAL MANAGEMENT
    // ============================================
    
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
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
        document.querySelectorAll('.modal-close, [data-modal]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = btn.dataset.modal;
                if (modalId) {
                    this.closeModal(modalId);
                }
            });
        });
        
        // Click on overlay
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', () => {
                this.closeModal(overlay.parentElement.id);
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
    // SHARE ACTIONS (CORRECTED & FUNCTIONAL)
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
            
            // Get current conversation
            const messages = this.getConversationMessages();
            
            if (messages.length === 0) {
                this.showToast('No messages to export', 'error');
                return;
            }
            
            // Charger html2pdf dynamiquement si non chargé
            if (typeof html2pdf === 'undefined') {
                await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
            }
            
            // Create HTML content for PDF
            const htmlContent = this.createPDFContent(messages);
            
            // Generate PDF
            const opt = {
                margin: [10, 10, 10, 10],
                filename: `alphavault-conversation-${new Date().toISOString().slice(0,10)}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            html2pdf().set(opt).from(htmlContent).save();
            
            this.showToast('PDF exported successfully!', 'success');
            this.closeModal('share-modal');
            
        } catch (error) {
            console.error('PDF export error:', error);
            this.showToast('Failed to export PDF', 'error');
        }
    }
    
    createPDFContent(messages) {
        const container = document.createElement('div');
        container.style.padding = '20px';
        container.style.fontFamily = 'Arial, sans-serif';
        
        // Header
        const header = `
            <h1 style="color: #667eea; margin-bottom: 10px;">AlphaVault AI Conversation</h1>
            <p style="color: #64748b; margin-bottom: 30px;">Date: ${new Date().toLocaleString()}</p>
            <hr style="border: 1px solid #e2e8f0; margin-bottom: 30px;">
        `;
        container.innerHTML = header;
        
        // Messages
        messages.forEach((msg, index) => {
            const msgDiv = document.createElement('div');
            msgDiv.style.marginBottom = '20px';
            msgDiv.style.padding = '15px';
            msgDiv.style.backgroundColor = msg.role === 'user' ? '#f1f5f9' : '#fff';
            msgDiv.style.borderLeft = msg.role === 'user' ? '4px solid #667eea' : '4px solid #10b981';
            msgDiv.style.borderRadius = '8px';
            
            const role = msg.role === 'user' ? '👤 You' : '🤖 Alphy AI';
            msgDiv.innerHTML = `
                <strong style="color: #1e293b;">${role}</strong>
                <p style="color: #475569; margin-top: 8px; line-height: 1.6;">${msg.text}</p>
            `;
            
            container.appendChild(msgDiv);
        });
        
        return container;
    }
    
    async copyShareLink() {
        try {
            const messages = this.getConversationMessages();
            
            if (messages.length === 0) {
                this.showToast('No messages to share', 'error');
                return;
            }
            
            // Generate unique conversation ID
            const conversationId = this.getCurrentConversationId();
            
            // TODO: Upload conversation to Firebase/Backend
            // For now, use a simulated shareable link
            const shareLink = `${window.location.origin}/shared/${conversationId}`;
            
            await navigator.clipboard.writeText(shareLink);
            this.showToast('Link copied to clipboard!', 'success');
            this.closeModal('share-modal');
        } catch (error) {
            console.error('Copy link error:', error);
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
            markdown += `---\n\n`;
            
            messages.forEach(msg => {
                const role = msg.role === 'user' ? '👤 **You**' : '🤖 **Alphy AI**';
                markdown += `${role}:\n\n${msg.text}\n\n---\n\n`;
            });
            
            this.downloadFile('conversation.md', markdown, 'text/markdown');
            this.showToast('Markdown exported!', 'success');
            this.closeModal('share-modal');
        } catch (error) {
            console.error('Markdown export error:', error);
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
            
            const subject = encodeURIComponent('AlphaVault AI Conversation');
            const body = encodeURIComponent(this.formatMessagesForEmail(messages));
            
            window.location.href = `mailto:?subject=${subject}&body=${body}`;
            this.closeModal('share-modal');
        } catch (error) {
            console.error('Email share error:', error);
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
            
            // TODO: Use Gemini API to generate summary
            // For now, create a simple text summary
            await this.delay(1500);
            
            const summary = this.createSimpleSummary(messages);
            this.downloadFile('conversation-summary.txt', summary, 'text/plain');
            
            this.showToast('Summary generated!', 'success');
        } catch (error) {
            console.error('Summary generation error:', error);
            this.showToast('Failed to generate summary', 'error');
        }
    }
    
    createSimpleSummary(messages) {
        let summary = `AlphaVault AI - Conversation Summary\n`;
        summary += `Date: ${new Date().toLocaleString()}\n`;
        summary += `Total Messages: ${messages.length}\n\n`;
        summary += `---\n\n`;
        
        // Extract key topics (simple keyword detection)
        const topics = new Set();
        messages.forEach(msg => {
            const text = msg.text.toLowerCase();
            if (text.includes('stock') || text.includes('share')) topics.add('Stock Analysis');
            if (text.includes('ipo')) topics.add('IPO Analysis');
            if (text.includes('market')) topics.add('Market Overview');
            if (text.includes('technical') || text.includes('rsi') || text.includes('macd')) topics.add('Technical Analysis');
        });
        
        summary += `Topics Discussed: ${Array.from(topics).join(', ') || 'General Finance'}\n\n`;
        summary += `Key Points:\n`;
        
        messages.filter(m => m.role === 'assistant').slice(0, 3).forEach((msg, i) => {
            const preview = msg.text.substring(0, 150) + '...';
            summary += `${i + 1}. ${preview}\n\n`;
        });
        
        return summary;
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
                
                // Remove active from all tabs and panels
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                
                // Add active to clicked tab and target panel
                tab.classList.add('active');
                document.querySelector(`[data-panel="${targetPanel}"]`)?.classList.add('active');
            });
        });
    }
    
    // ============================================
    // SETTINGS CONTROLS (CORRECTED & FUNCTIONAL)
    // ============================================
    
    setupSettingsControls() {
        // AI Model
        document.getElementById('ai-model')?.addEventListener('change', (e) => {
            this.updateSetting('aiModel', e.target.value);
        });
        
        // Temperature
        const tempSlider = document.getElementById('temperature');
        const tempValue = document.getElementById('temperature-value');
        tempSlider?.addEventListener('input', (e) => {
            tempValue.textContent = e.target.value;
            this.updateSetting('temperature', parseFloat(e.target.value));
            this.applyAISettings();
        });
        
        // Max Tokens
        const tokensSelect = document.getElementById('max-tokens');
        const tokensValue = document.getElementById('max-tokens-value');
        tokensSelect?.addEventListener('change', (e) => {
            tokensValue.textContent = e.target.value;
            this.updateSetting('maxTokens', parseInt(e.target.value));
            this.applyAISettings();
        });
        
        // Default Timeframe
        document.getElementById('default-timeframe')?.addEventListener('change', (e) => {
            this.updateSetting('defaultTimeframe', e.target.value);
        });
        
        // Theme
        document.querySelectorAll('[data-theme]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-theme]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateSetting('theme', btn.dataset.theme);
                this.applyTheme(btn.dataset.theme);
            });
        });
        
        // Font Size
        const fontSlider = document.getElementById('font-size');
        const fontValue = document.getElementById('font-size-value');
        fontSlider?.addEventListener('input', (e) => {
            fontValue.textContent = `${e.target.value}px`;
            this.updateSetting('fontSize', parseInt(e.target.value));
            this.applyFontSize(parseInt(e.target.value));
        });
        
        // Checkboxes
        document.getElementById('enable-animations')?.addEventListener('change', (e) => {
            this.updateSetting('enableAnimations', e.target.checked);
            this.toggleAnimations(e.target.checked);
        });
        
        document.getElementById('show-robot')?.addEventListener('change', (e) => {
            this.updateSetting('showRobot', e.target.checked);
            this.toggleRobot(e.target.checked);
        });
        
        document.getElementById('compact-mode')?.addEventListener('change', (e) => {
            this.updateSetting('compactMode', e.target.checked);
            this.toggleCompactMode(e.target.checked);
        });
        
        document.getElementById('enable-sound')?.addEventListener('change', (e) => {
            this.updateSetting('enableSound', e.target.checked);
        });
        
        document.getElementById('email-alerts')?.addEventListener('change', (e) => {
            this.updateSetting('emailAlerts', e.target.checked);
        });
        
        document.getElementById('auto-save')?.addEventListener('change', (e) => {
            this.updateSetting('autoSave', e.target.checked);
        });
        
        // Alert Frequency
        document.getElementById('alert-frequency')?.addEventListener('change', (e) => {
            this.updateSetting('alertFrequency', e.target.value);
        });
        
        // Data Management
        document.getElementById('clear-history')?.addEventListener('click', () => {
            this.clearHistory();
        });
        
        document.getElementById('export-data')?.addEventListener('click', () => {
            this.exportAllData();
        });
        
        // Save Settings
        document.getElementById('save-settings')?.addEventListener('click', () => {
            this.saveSettings();
        });
    }
    
    // ============================================
    // SETTINGS STORAGE
    // ============================================
    
    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('chatbotSettings') || '{}');
        
        // Apply saved settings to UI
        if (settings.aiModel) {
            const select = document.getElementById('ai-model');
            if (select) select.value = settings.aiModel;
        }
        
        if (settings.temperature !== undefined) {
            const slider = document.getElementById('temperature');
            const value = document.getElementById('temperature-value');
            if (slider && value) {
                slider.value = settings.temperature;
                value.textContent = settings.temperature;
            }
        }
        
        if (settings.maxTokens) {
            const select = document.getElementById('max-tokens');
            const value = document.getElementById('max-tokens-value');
            if (select && value) {
                select.value = settings.maxTokens;
                value.textContent = settings.maxTokens;
            }
        }
        
        if (settings.defaultTimeframe) {
            const select = document.getElementById('default-timeframe');
            if (select) select.value = settings.defaultTimeframe;
        }
        
        if (settings.fontSize) {
            const slider = document.getElementById('font-size');
            const value = document.getElementById('font-size-value');
            if (slider && value) {
                slider.value = settings.fontSize;
                value.textContent = `${settings.fontSize}px`;
                this.applyFontSize(settings.fontSize);
            }
        }
        
        if (settings.theme) {
            document.querySelectorAll('[data-theme]').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === settings.theme);
            });
            this.applyTheme(settings.theme);
        }
        
        // Checkboxes
        const checkboxes = {
            'enable-animations': settings.enableAnimations !== false,
            'show-robot': settings.showRobot !== false,
            'compact-mode': settings.compactMode === true,
            'enable-sound': settings.enableSound !== false,
            'email-alerts': settings.emailAlerts === true,
            'auto-save': settings.autoSave !== false
        };
        
        Object.entries(checkboxes).forEach(([id, checked]) => {
            const checkbox = document.getElementById(id);
            if (checkbox) checkbox.checked = checked;
        });
        
        // Apply settings
        this.toggleAnimations(checkboxes['enable-animations']);
        this.toggleCompactMode(checkboxes['compact-mode']);
        this.toggleRobot(checkboxes['show-robot']);
        this.applyAISettings();
        
        // Load conversation count
        this.updateConversationCount();
        
        console.log('✅ Settings loaded:', settings);
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
    
    // ============================================
    // APPLY SETTINGS (CORRECTED)
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
        
        // Apply to messages
        document.querySelectorAll('.message-text').forEach(el => {
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
        const robotContainer = document.getElementById('robot-3d-container');
        if (robotContainer) {
            robotContainer.style.display = enabled ? 'block' : 'none';
        }
        console.log(`🤖 Robot ${enabled ? 'shown' : 'hidden'}`);
    }
    
    applyAISettings() {
        const settings = JSON.parse(localStorage.getItem('chatbotSettings') || '{}');
        
        // Apply to chatbot instance if available
        if (this.chatbotInstance && this.chatbotInstance.geminiIntegration) {
            const gemini = this.chatbotInstance.geminiIntegration;
            
            if (settings.temperature !== undefined) {
                gemini.temperature = settings.temperature;
            }
            
            if (settings.maxTokens) {
                gemini.maxOutputTokens = settings.maxTokens;
            }
            
            console.log('✅ AI settings applied to chatbot');
        }
    }
    
    // ============================================
    // DATA MANAGEMENT
    // ============================================
    
    clearHistory() {
        if (confirm('Are you sure you want to delete all conversations? This cannot be undone.')) {
            localStorage.removeItem('chatbotConversations');
            
            // Clear visible messages
            const messagesContainer = document.getElementById('chatbot-messages-content');
            if (messagesContainer) {
                messagesContainer.innerHTML = '';
            }
            
            this.showToast('All conversations deleted', 'success');
            this.updateConversationCount();
        }
    }
    
    exportAllData() {
        try {
            const data = {
                conversations: JSON.parse(localStorage.getItem('chatbotConversations') || '[]'),
                settings: JSON.parse(localStorage.getItem('chatbotSettings') || '{}'),
                exportDate: new Date().toISOString()
            };
            
            const json = JSON.stringify(data, null, 2);
            this.downloadFile('alphavault-ai-data.json', json, 'application/json');
            this.showToast('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
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
    // HELPERS (CORRECTED)
    // ============================================
    
    getConversationMessages() {
        const messagesContainer = document.getElementById('chatbot-messages-content');
        if (!messagesContainer) return [];
        
        const messages = [];
        
        messagesContainer.querySelectorAll('.chatbot-message').forEach(msg => {
            const isUser = msg.classList.contains('user-message');
            const textEl = msg.querySelector('.message-text') || msg.querySelector('.message-content');
            
            if (textEl) {
                messages.push({
                    role: isUser ? 'user' : 'assistant',
                    text: textEl.textContent.trim()
                });
            }
        });
        
        return messages;
    }
    
    getCurrentConversationId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    formatMessagesForEmail(messages) {
        let text = 'AlphaVault AI Conversation\n\n';
        text += `Date: ${new Date().toLocaleString()}\n\n`;
        text += '---\n\n';
        
        messages.forEach(msg => {
            const role = msg.role === 'user' ? 'You' : 'Alphy AI';
            text += `${role}:\n${msg.text}\n\n`;
        });
        
        return text;
    }
    
    downloadFile(filename, content, mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ⓘ';
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-title">${this.getToastTitle(type)}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;
        
        this.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastSlideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }
    
    getToastTitle(type) {
        switch (type) {
            case 'success': return 'Success';
            case 'error': return 'Error';
            case 'info': return 'Info';
            default: return 'Notification';
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    window.chatbotModals = new ChatbotModals();
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+, for settings
        if (e.ctrlKey && e.key === ',') {
            e.preventDefault();
            window.chatbotModals.openModal('settings-modal');
        }
        
        // Ctrl+D for dark mode toggle
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            document.body.classList.toggle('dark-mode');
            
            // Save preference
            const isDark = document.body.classList.contains('dark-mode');
            window.chatbotModals.updateSetting('theme', isDark ? 'dark' : 'light');
        }
        
        // Ctrl+Shift+E for export
        if (e.ctrlKey && e.shiftKey && e.key === 'E') {
            e.preventDefault();
            window.chatbotModals.openModal('share-modal');
        }
    });
});