/* ============================================
   CHATBOT MODALS - SHARE & SETTINGS
   Version 1.0 - Premium Modals System
   ============================================ */

class ChatbotModals {
    constructor() {
        this.modals = {};
        this.init();
    }

    init() {
        console.log('🎭 Initializing Chatbot Modals...');
        this.createModalsHTML();
        this.attachEventListeners();
        this.loadSettings();
        console.log('✅ Modals initialized successfully!');
    }

    /**
     * Crée le HTML des modals
     */
    createModalsHTML() {
        const modalsContainer = document.createElement('div');
        modalsContainer.id = 'chatbot-modals-container';
        modalsContainer.innerHTML = `
            <!-- ========================================
                 SHARE MODAL
                 ======================================== -->
            <div class="chatbot-modal" id="share-modal">
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">
                            <i class="fas fa-share-alt"></i>
                            Share Conversation
                        </h2>
                        <button class="modal-close" data-modal="share-modal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="share-options">
                            <button class="share-option-btn" id="share-link-btn">
                                <div class="share-option-icon">
                                    <i class="fas fa-link"></i>
                                </div>
                                <div class="share-option-content">
                                    <div class="share-option-title">Copy Link</div>
                                    <div class="share-option-desc">Share via shareable link</div>
                                </div>
                            </button>
                            
                            <button class="share-option-btn" id="share-email-btn">
                                <div class="share-option-icon">
                                    <i class="fas fa-envelope"></i>
                                </div>
                                <div class="share-option-content">
                                    <div class="share-option-title">Email</div>
                                    <div class="share-option-desc">Send via email</div>
                                </div>
                            </button>
                            
                            <button class="share-option-btn" id="share-export-btn">
                                <div class="share-option-icon">
                                    <i class="fas fa-download"></i>
                                </div>
                                <div class="share-option-content">
                                    <div class="share-option-title">Export</div>
                                    <div class="share-option-desc">Download as PDF or TXT</div>
                                </div>
                            </button>
                            
                            <button class="share-option-btn" id="share-screenshot-btn">
                                <div class="share-option-icon">
                                    <i class="fas fa-camera"></i>
                                </div>
                                <div class="share-option-content">
                                    <div class="share-option-title">Screenshot</div>
                                    <div class="share-option-desc">Capture as image</div>
                                </div>
                            </button>
                        </div>
                        
                        <!-- Export Format Selection (Hidden by default) -->
                        <div class="export-format-selector" id="export-format-selector" style="display: none;">
                            <h3 class="export-format-title">Choose Export Format</h3>
                            <div class="export-format-buttons">
                                <button class="export-format-btn" data-format="pdf">
                                    <i class="fas fa-file-pdf"></i>
                                    <span>PDF Document</span>
                                </button>
                                <button class="export-format-btn" data-format="txt">
                                    <i class="fas fa-file-alt"></i>
                                    <span>Text File</span>
                                </button>
                                <button class="export-format-btn" data-format="json">
                                    <i class="fas fa-code"></i>
                                    <span>JSON Data</span>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Success Message -->
                        <div class="share-success-message" id="share-success-message" style="display: none;">
                            <i class="fas fa-check-circle"></i>
                            <span>Link copied to clipboard!</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ========================================
                 SETTINGS MODAL
                 ======================================== -->
            <div class="chatbot-modal" id="settings-modal">
                <div class="modal-overlay"></div>
                <div class="modal-content modal-content-large">
                    <div class="modal-header">
                        <h2 class="modal-title">
                            <i class="fas fa-cog"></i>
                            Settings
                        </h2>
                        <button class="modal-close" data-modal="settings-modal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <!-- Settings Tabs -->
                        <div class="settings-tabs">
                            <button class="settings-tab active" data-tab="general">
                                <i class="fas fa-sliders-h"></i>
                                <span>General</span>
                            </button>
                            <button class="settings-tab" data-tab="appearance">
                                <i class="fas fa-palette"></i>
                                <span>Appearance</span>
                            </button>
                            <button class="settings-tab" data-tab="notifications">
                                <i class="fas fa-bell"></i>
                                <span>Notifications</span>
                            </button>
                            <button class="settings-tab" data-tab="privacy">
                                <i class="fas fa-shield-alt"></i>
                                <span>Privacy</span>
                            </button>
                        </div>
                        
                        <!-- Settings Content -->
                        <div class="settings-content">
                            <!-- General Tab -->
                            <div class="settings-panel active" data-panel="general">
                                <h3 class="settings-panel-title">General Settings</h3>
                                
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-label">Language</div>
                                        <div class="setting-desc">Choose your preferred language</div>
                                    </div>
                                    <select class="setting-select" id="language-select">
                                        <option value="en">English</option>
                                        <option value="fr">Français</option>
                                        <option value="es">Español</option>
                                        <option value="de">Deutsch</option>
                                    </select>
                                </div>
                                
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-label">Auto-save conversations</div>
                                        <div class="setting-desc">Automatically save your chat history</div>
                                    </div>
                                    <label class="setting-toggle">
                                        <input type="checkbox" id="auto-save-toggle" checked>
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-label">Show timestamps</div>
                                        <div class="setting-desc">Display time for each message</div>
                                    </div>
                                    <label class="setting-toggle">
                                        <input type="checkbox" id="timestamps-toggle" checked>
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-label">Message font size</div>
                                        <div class="setting-desc">Adjust text size for better readability</div>
                                    </div>
                                    <select class="setting-select" id="font-size-select">
                                        <option value="small">Small</option>
                                        <option value="medium" selected>Medium</option>
                                        <option value="large">Large</option>
                                    </select>
                                </div>
                            </div>
                            
                            <!-- Appearance Tab -->
                            <div class="settings-panel" data-panel="appearance">
                                <h3 class="settings-panel-title">Appearance</h3>
                                
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-label">Theme</div>
                                        <div class="setting-desc">Choose light or dark mode</div>
                                    </div>
                                    <div class="theme-selector">
                                        <button class="theme-option active" data-theme="light">
                                            <i class="fas fa-sun"></i>
                                            <span>Light</span>
                                        </button>
                                        <button class="theme-option" data-theme="dark">
                                            <i class="fas fa-moon"></i>
                                            <span>Dark</span>
                                        </button>
                                        <button class="theme-option" data-theme="auto">
                                            <i class="fas fa-adjust"></i>
                                            <span>Auto</span>
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-label">Particle effects</div>
                                        <div class="setting-desc">Enable animated background particles</div>
                                    </div>
                                    <label class="setting-toggle">
                                        <input type="checkbox" id="particles-toggle" checked>
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-label">Animations</div>
                                        <div class="setting-desc">Enable smooth transitions and effects</div>
                                    </div>
                                    <label class="setting-toggle">
                                        <input type="checkbox" id="animations-toggle" checked>
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-label">Compact mode</div>
                                        <div class="setting-desc">Reduce spacing for more content</div>
                                    </div>
                                    <label class="setting-toggle">
                                        <input type="checkbox" id="compact-mode-toggle">
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                            
                            <!-- Notifications Tab -->
                            <div class="settings-panel" data-panel="notifications">
                                <h3 class="settings-panel-title">Notifications</h3>
                                
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-label">Desktop notifications</div>
                                        <div class="setting-desc">Receive notifications on your desktop</div>
                                    </div>
                                    <label class="setting-toggle">
                                        <input type="checkbox" id="desktop-notifications-toggle">
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-label">Sound alerts</div>
                                        <div class="setting-desc">Play sound when receiving messages</div>
                                    </div>
                                    <label class="setting-toggle">
                                        <input type="checkbox" id="sound-alerts-toggle" checked>
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-label">Email digest</div>
                                        <div class="setting-desc">Receive daily summary via email</div>
                                    </div>
                                    <label class="setting-toggle">
                                        <input type="checkbox" id="email-digest-toggle">
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                            
                            <!-- Privacy Tab -->
                            <div class="settings-panel" data-panel="privacy">
                                <h3 class="settings-panel-title">Privacy & Data</h3>
                                
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-label">Save conversation history</div>
                                        <div class="setting-desc">Store your chat history locally</div>
                                    </div>
                                    <label class="setting-toggle">
                                        <input type="checkbox" id="save-history-toggle" checked>
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-label">Analytics & tracking</div>
                                        <div class="setting-desc">Help improve our service with usage data</div>
                                    </div>
                                    <label class="setting-toggle">
                                        <input type="checkbox" id="analytics-toggle" checked>
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                
                                <div class="setting-item setting-item-danger">
                                    <div class="setting-info">
                                        <div class="setting-label">Clear all data</div>
                                        <div class="setting-desc">Delete all conversations and settings</div>
                                    </div>
                                    <button class="setting-danger-btn" id="clear-data-btn">
                                        <i class="fas fa-trash-alt"></i>
                                        Clear Data
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Settings Footer -->
                        <div class="settings-footer">
                            <button class="settings-reset-btn" id="reset-settings-btn">
                                <i class="fas fa-undo"></i>
                                Reset to Defaults
                            </button>
                            <button class="settings-save-btn" id="save-settings-btn">
                                <i class="fas fa-check"></i>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalsContainer);
    }

    /**
     * Attache les event listeners
     */
    attachEventListeners() {
        // Open modals
        document.getElementById('share-btn')?.addEventListener('click', () => this.openModal('share-modal'));
        document.getElementById('settings-btn')?.addEventListener('click', () => this.openModal('settings-modal'));
        
        // Close modals
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.currentTarget.dataset.modal;
                this.closeModal(modalId);
            });
        });
        
        // Close on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                const modal = e.currentTarget.closest('.chatbot-modal');
                this.closeModal(modal.id);
            });
        });
        
        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
        
        // Share options
        document.getElementById('share-link-btn')?.addEventListener('click', () => this.shareViaLink());
        document.getElementById('share-email-btn')?.addEventListener('click', () => this.shareViaEmail());
        document.getElementById('share-export-btn')?.addEventListener('click', () => this.showExportOptions());
        document.getElementById('share-screenshot-btn')?.addEventListener('click', () => this.takeScreenshot());
        
        // Export formats
        document.querySelectorAll('.export-format-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const format = e.currentTarget.dataset.format;
                this.exportConversation(format);
            });
        });
        
        // Settings tabs
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.currentTarget));
        });
        
        // Settings actions
        document.getElementById('save-settings-btn')?.addEventListener('click', () => this.saveSettings());
        document.getElementById('reset-settings-btn')?.addEventListener('click', () => this.resetSettings());
        document.getElementById('clear-data-btn')?.addEventListener('click', () => this.clearAllData());
        
        // Theme selector
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.addEventListener('click', (e) => this.changeTheme(e.currentTarget));
        });
    }

    /**
     * Ouvrir un modal
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            console.log(`📖 Modal opened: ${modalId}`);
        }
    }

    /**
     * Fermer un modal
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            
            // Reset export selector
            const exportSelector = document.getElementById('export-format-selector');
            if (exportSelector) exportSelector.style.display = 'none';
            
            console.log(`📕 Modal closed: ${modalId}`);
        }
    }

    /**
     * Fermer tous les modals
     */
    closeAllModals() {
        document.querySelectorAll('.chatbot-modal.active').forEach(modal => {
            this.closeModal(modal.id);
        });
    }

    /**
     * Partager via lien
     */
    async shareViaLink() {
        const conversationId = this.generateConversationId();
        const shareUrl = `${window.location.origin}/shared/${conversationId}`;
        
        try {
            await navigator.clipboard.writeText(shareUrl);
            this.showSuccessMessage('Link copied to clipboard!');
            console.log('🔗 Share link copied:', shareUrl);
        } catch (err) {
            console.error('❌ Failed to copy link:', err);
            this.showSuccessMessage('Failed to copy link', true);
        }
    }

    /**
     * Partager via email
     */
    shareViaEmail() {
        const subject = encodeURIComponent('Check out this Alphy AI conversation');
        const body = encodeURIComponent(`I wanted to share this interesting conversation with Alphy AI:\n\n${window.location.href}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
        console.log('📧 Opening email client...');
    }

    /**
     * Afficher les options d'export
     */
    showExportOptions() {
        const exportSelector = document.getElementById('export-format-selector');
        if (exportSelector) {
            exportSelector.style.display = 'block';
            exportSelector.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    /**
     * Exporter la conversation
     */
    exportConversation(format) {
        console.log(`📥 Exporting conversation as ${format.toUpperCase()}...`);
        
        const messages = this.getConversationMessages();
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `alphy-ai-conversation-${timestamp}`;
        
        switch (format) {
            case 'txt':
                this.downloadTextFile(messages, filename);
                break;
            case 'json':
                this.downloadJSONFile(messages, filename);
                break;
            case 'pdf':
                this.showSuccessMessage('PDF export coming soon!');
                break;
        }
        
        this.closeModal('share-modal');
    }

    /**
     * Prendre une capture d'écran
     */
    takeScreenshot() {
        this.showSuccessMessage('Screenshot feature coming soon!');
        console.log('📸 Taking screenshot...');
    }

    /**
     * Récupérer les messages de la conversation
     */
    getConversationMessages() {
        const messagesContainer = document.getElementById('chatbot-messages-content');
        const messages = [];
        
        messagesContainer.querySelectorAll('.message').forEach(msg => {
            const isUser = msg.classList.contains('user-message');
            const text = msg.querySelector('.message-text')?.textContent || '';
            const time = msg.querySelector('.message-time')?.textContent || '';
            
            messages.push({
                role: isUser ? 'user' : 'assistant',
                content: text,
                timestamp: time
            });
        });
        
        return messages;
    }

    /**
     * Télécharger en TXT
     */
    downloadTextFile(messages, filename) {
        let content = `Alphy AI Conversation\n${'='.repeat(50)}\n\n`;
        
        messages.forEach(msg => {
            content += `${msg.role.toUpperCase()}: ${msg.content}\n`;
            if (msg.timestamp) content += `Time: ${msg.timestamp}\n`;
            content += '\n';
        });
        
        this.downloadFile(content, `${filename}.txt`, 'text/plain');
    }

    /**
     * Télécharger en JSON
     */
    downloadJSONFile(messages, filename) {
        const data = {
            platform: 'Alphy AI',
            exportDate: new Date().toISOString(),
            messages: messages
        };
        
        const content = JSON.stringify(data, null, 2);
        this.downloadFile(content, `${filename}.json`, 'application/json');
    }

    /**
     * Télécharger un fichier
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccessMessage(`Downloaded: ${filename}`);
    }

    /**
     * Générer un ID de conversation
     */
    generateConversationId() {
        return 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Afficher un message de succès
     */
    showSuccessMessage(message, isError = false) {
        const successMsg = document.getElementById('share-success-message');
        if (successMsg) {
            successMsg.textContent = message;
            successMsg.style.display = 'flex';
            successMsg.style.background = isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)';
            successMsg.style.color = isError ? '#dc2626' : '#059669';
            
            setTimeout(() => {
                successMsg.style.display = 'none';
            }, 3000);
        }
    }

    /**
     * Changer de tab dans les settings
     */
    switchTab(tabElement) {
        const targetTab = tabElement.dataset.tab;
        
        // Update tabs
        document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
        tabElement.classList.add('active');
        
        // Update panels
        document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
        document.querySelector(`[data-panel="${targetTab}"]`)?.classList.add('active');
    }

    /**
     * Changer le thème
     */
    changeTheme(themeBtn) {
        const theme = themeBtn.dataset.theme;
        
        document.querySelectorAll('.theme-option').forEach(btn => btn.classList.remove('active'));
        themeBtn.classList.add('active');
        
        // Apply theme
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else if (theme === 'light') {
            document.body.classList.remove('dark-mode');
        } else {
            // Auto mode based on system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.classList.toggle('dark-mode', prefersDark);
        }
        
        console.log(`🎨 Theme changed to: ${theme}`);
    }

    /**
     * Sauvegarder les paramètres
     */
    saveSettings() {
        const settings = {
            language: document.getElementById('language-select')?.value,
            autoSave: document.getElementById('auto-save-toggle')?.checked,
            timestamps: document.getElementById('timestamps-toggle')?.checked,
            fontSize: document.getElementById('font-size-select')?.value,
            particles: document.getElementById('particles-toggle')?.checked,
            animations: document.getElementById('animations-toggle')?.checked,
            compactMode: document.getElementById('compact-mode-toggle')?.checked,
            desktopNotifications: document.getElementById('desktop-notifications-toggle')?.checked,
            soundAlerts: document.getElementById('sound-alerts-toggle')?.checked,
            emailDigest: document.getElementById('email-digest-toggle')?.checked,
            saveHistory: document.getElementById('save-history-toggle')?.checked,
            analytics: document.getElementById('analytics-toggle')?.checked
        };
        
        localStorage.setItem('alphyAISettings', JSON.stringify(settings));
        this.showSuccessMessage('Settings saved successfully!');
        this.closeModal('settings-modal');
        
        console.log('💾 Settings saved:', settings);
    }

    /**
     * Charger les paramètres
     */
    loadSettings() {
        const savedSettings = localStorage.getItem('alphyAISettings');
        if (!savedSettings) return;
        
        try {
            const settings = JSON.parse(savedSettings);
            
            // Apply settings
            if (settings.language) document.getElementById('language-select').value = settings.language;
            if (settings.fontSize) document.getElementById('font-size-select').value = settings.fontSize;
            
            // Toggles
            document.getElementById('auto-save-toggle').checked = settings.autoSave ?? true;
            document.getElementById('timestamps-toggle').checked = settings.timestamps ?? true;
            document.getElementById('particles-toggle').checked = settings.particles ?? true;
            document.getElementById('animations-toggle').checked = settings.animations ?? true;
            document.getElementById('compact-mode-toggle').checked = settings.compactMode ?? false;
            document.getElementById('desktop-notifications-toggle').checked = settings.desktopNotifications ?? false;
            document.getElementById('sound-alerts-toggle').checked = settings.soundAlerts ?? true;
            document.getElementById('email-digest-toggle').checked = settings.emailDigest ?? false;
            document.getElementById('save-history-toggle').checked = settings.saveHistory ?? true;
            document.getElementById('analytics-toggle').checked = settings.analytics ?? true;
            
            console.log('⚙ Settings loaded');
        } catch (err) {
            console.error('❌ Failed to load settings:', err);
        }
    }

    /**
     * Réinitialiser les paramètres
     */
    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            localStorage.removeItem('alphyAISettings');
            location.reload();
            console.log('🔄 Settings reset to defaults');
        }
    }

    /**
     * Effacer toutes les données
     */
    clearAllData() {
        if (confirm('⚠ This will delete ALL your conversations and settings. This action cannot be undone. Are you sure?')) {
            localStorage.clear();
            sessionStorage.clear();
            location.reload();
            console.log('🗑 All data cleared');
        }
    }
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    window.chatbotModals = new ChatbotModals();
});