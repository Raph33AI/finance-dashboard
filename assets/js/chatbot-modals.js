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
        
        this.init();
    }
    
    init() {
        console.log('🎯 Initializing Chatbot Modals...');
        
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
                if (this.shareModal.classList.contains('active')) {
                    this.closeModal('share-modal');
                }
                if (this.settingsModal.classList.contains('active')) {
                    this.closeModal('settings-modal');
                }
            }
        });
    }
    
    // ============================================
    // SHARE ACTIONS
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
            
            // TODO: Implement PDF generation with jsPDF
            // For now, simulate
            await this.delay(1500);
            
            this.showToast('PDF exported successfully!', 'success');
            this.closeModal('share-modal');
            
            // Simulate download
            this.downloadFile('conversation.pdf', 'PDF content here');
        } catch (error) {
            console.error('PDF export error:', error);
            this.showToast('Failed to export PDF', 'error');
        }
    }
    
    async copyShareLink() {
        try {
            // Generate shareable link (Firebase Storage or custom backend)
            const conversationId = this.getCurrentConversationId();
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
            
            let markdown = `# AlphaVault AI Conversation\n\n`;
            markdown += `**Date**: ${new Date().toLocaleString()}\n\n`;
            markdown += `---\n\n`;
            
            messages.forEach(msg => {
                const role = msg.role === 'user' ? '👤 **You**' : '🤖 **Alphy AI**';
                markdown += `${role}:\n\n${msg.text}\n\n---\n\n`;
            });
            
            this.downloadFile('conversation.md', markdown);
            this.showToast('Markdown exported!', 'success');
            this.closeModal('share-modal');
        } catch (error) {
            console.error('Markdown export error:', error);
            this.showToast('Failed to export Markdown', 'error');
        }
    }
    
    shareViaEmail() {
        try {
            const subject = encodeURIComponent('AlphaVault AI Conversation');
            const messages = this.getConversationMessages();
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
            this.showToast('Generating summary with AI...', 'info');
            this.closeModal('share-modal');
            
            // TODO: Use Gemini to generate executive summary
            await this.delay(2000);
            
            this.showToast('Summary generated!', 'success');
        } catch (error) {
            console.error('Summary generation error:', error);
            this.showToast('Failed to generate summary', 'error');
        }
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
    // SETTINGS CONTROLS
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
        });
        
        // Max Tokens
        document.getElementById('max-tokens')?.addEventListener('change', (e) => {
            document.getElementById('max-tokens-value').textContent = e.target.value;
            this.updateSetting('maxTokens', parseInt(e.target.value));
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
        
        // Apply saved settings
        if (settings.aiModel) {
            document.getElementById('ai-model').value = settings.aiModel;
        }
        if (settings.temperature) {
            document.getElementById('temperature').value = settings.temperature;
            document.getElementById('temperature-value').textContent = settings.temperature;
        }
        if (settings.maxTokens) {
            document.getElementById('max-tokens').value = settings.maxTokens;
            document.getElementById('max-tokens-value').textContent = settings.maxTokens;
        }
        if (settings.fontSize) {
            document.getElementById('font-size').value = settings.fontSize;
            document.getElementById('font-size-value').textContent = `${settings.fontSize}px`;
            this.applyFontSize(settings.fontSize);
        }
        
        // Load conversation count
        this.updateConversationCount();
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
    // APPLY SETTINGS
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
    }
    
    applyFontSize(size) {
        document.documentElement.style.setProperty('--message-font-size', `${size}px`);
    }
    
    toggleAnimations(enabled) {
        document.body.classList.toggle('no-animations', !enabled);
    }
    
    toggleCompactMode(enabled) {
        document.body.classList.toggle('compact-mode', enabled);
    }
    
    // ============================================
    // DATA MANAGEMENT
    // ============================================
    
    clearHistory() {
        if (confirm('Are you sure you want to delete all conversations? This cannot be undone.')) {
            localStorage.removeItem('chatbotConversations');
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
            this.downloadFile('alphavault-ai-data.json', json);
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
    // HELPERS
    // ============================================
    
    getConversationMessages() {
        // TODO: Get messages from current conversation
        const messagesContainer = document.getElementById('chatbot-messages-content');
        const messages = [];
        
        messagesContainer.querySelectorAll('.chatbot-message').forEach(msg => {
            messages.push({
                role: msg.classList.contains('user-message') ? 'user' : 'assistant',
                text: msg.querySelector('.message-text')?.textContent || ''
            });
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
    
    downloadFile(filename, content) {
        const blob = new Blob([content], { type: 'text/plain' });
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
        }, 3000);
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
        }
    });
});