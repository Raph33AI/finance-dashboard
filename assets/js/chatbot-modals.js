/* ============================================
   CHATBOT MODALS - SHARE & SETTINGS
   Version 2.0 - ULTRA ADVANCED EDITION
   ✅ PDF Export (jsPDF)
   ✅ Screenshot (html2canvas)
   ✅ Advanced sharing options
   ✅ Settings without particles/animations toggles
   ============================================ */

class ChatbotModals {
    constructor() {
        this.modals = {};
        this.init();
    }

    init() {
        console.log('🎭 Initializing Advanced Chatbot Modals...');
        this.createModalsHTML();
        this.attachEventListeners();
        this.loadSettings();
        console.log('✅ Advanced Modals initialized successfully!');
    }

    /**
     * Crée le HTML des modals
     */
    createModalsHTML() {
        const modalsContainer = document.createElement('div');
        modalsContainer.id = 'chatbot-modals-container';
        modalsContainer.innerHTML = `
            <!-- ========================================
                 SHARE MODAL - ADVANCED VERSION
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
                        
                        <!-- Screenshot Options -->
                        <div class="screenshot-options" id="screenshot-options" style="display: none;">
                            <h3 class="export-format-title">Screenshot Options</h3>
                            <div class="export-format-buttons">
                                <button class="export-format-btn" id="screenshot-full">
                                    <i class="fas fa-expand"></i>
                                    <span>Full Conversation</span>
                                </button>
                                <button class="export-format-btn" id="screenshot-visible">
                                    <i class="fas fa-desktop"></i>
                                    <span>Visible Area</span>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Success Message -->
                        <div class="share-success-message" id="share-success-message" style="display: none;">
                            <i class="fas fa-check-circle"></i>
                            <span>Link copied to clipboard!</span>
                        </div>
                        
                        <!-- Loading Indicator -->
                        <div class="export-loading" id="export-loading" style="display: none;">
                            <div class="loading-spinner"></div>
                            <span>Generating export...</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ========================================
                 SETTINGS MODAL - WITHOUT PARTICLES/ANIMATIONS
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
                                
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-label">Enter key behavior</div>
                                        <div class="setting-desc">Choose what happens when you press Enter</div>
                                    </div>
                                    <select class="setting-select" id="enter-behavior-select">
                                        <option value="send" selected>Send message</option>
                                        <option value="newline">New line (Ctrl+Enter to send)</option>
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
                                        <div class="setting-label">Compact mode</div>
                                        <div class="setting-desc">Reduce spacing for more content</div>
                                    </div>
                                    <label class="setting-toggle">
                                        <input type="checkbox" id="compact-mode-toggle">
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                
                                <div class="setting-item">
                                    <div class="setting-info">
                                        <div class="setting-label">Show avatars</div>
                                        <div class="setting-desc">Display profile pictures in messages</div>
                                    </div>
                                    <label class="setting-toggle">
                                        <input type="checkbox" id="show-avatars-toggle" checked>
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
        document.getElementById('share-screenshot-btn')?.addEventListener('click', () => this.showScreenshotOptions());
        
        // Export formats
        document.querySelectorAll('.export-format-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const format = e.currentTarget.dataset.format;
                if (format) {
                    this.exportConversation(format);
                }
            });
        });
        
        // Screenshot options
        document.getElementById('screenshot-full')?.addEventListener('click', () => this.takeScreenshot('full'));
        document.getElementById('screenshot-visible')?.addEventListener('click', () => this.takeScreenshot('visible'));
        
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
            
            // Reset selectors
            const exportSelector = document.getElementById('export-format-selector');
            const screenshotOptions = document.getElementById('screenshot-options');
            if (exportSelector) exportSelector.style.display = 'none';
            if (screenshotOptions) screenshotOptions.style.display = 'none';
            
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
        const screenshotOptions = document.getElementById('screenshot-options');
        
        if (screenshotOptions) screenshotOptions.style.display = 'none';
        
        if (exportSelector) {
            exportSelector.style.display = 'block';
            exportSelector.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    /**
     * Afficher les options de screenshot
     */
    showScreenshotOptions() {
        const exportSelector = document.getElementById('export-format-selector');
        const screenshotOptions = document.getElementById('screenshot-options');
        
        if (exportSelector) exportSelector.style.display = 'none';
        
        if (screenshotOptions) {
            screenshotOptions.style.display = 'block';
            screenshotOptions.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    /**
     * Exporter la conversation
     */
    async exportConversation(format) {
        console.log(`📥 Exporting conversation as ${format.toUpperCase()}...`);
        
        this.showLoading(true);
        
        const messages = this.getConversationMessages();
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `alphy-ai-conversation-${timestamp}`;
        
        try {
            switch (format) {
                case 'txt':
                    await this.downloadTextFile(messages, filename);
                    break;
                case 'json':
                    await this.downloadJSONFile(messages, filename);
                    break;
                case 'pdf':
                    await this.downloadPDFFile(messages, filename);
                    break;
            }
            
            this.showSuccessMessage(`${format.toUpperCase()} exported successfully!`);
            setTimeout(() => this.closeModal('share-modal'), 1500);
        } catch (error) {
            console.error('❌ Export error:', error);
            this.showSuccessMessage('Export failed. Please try again.', true);
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Prendre une capture d'écran
     */
    async takeScreenshot(mode = 'full') {
        console.log(`📸 Taking ${mode} screenshot...`);
        
        this.showLoading(true);
        
        try {
            if (typeof html2canvas === 'undefined') {
                throw new Error('html2canvas library not loaded');
            }
            
            const container = document.getElementById('chatbot-messages-content');
            
            if (!container) {
                throw new Error('Messages container not found');
            }
            
            // Temporarily hide scrollbar
            const originalOverflow = container.style.overflow;
            container.style.overflow = 'visible';
            
            // Options for html2canvas
            const options = {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true
            };
            
            if (mode === 'visible') {
                options.height = window.innerHeight;
                options.windowHeight = window.innerHeight;
            }
            
            const canvas = await html2canvas(container, options);
            
            // Restore scrollbar
            container.style.overflow = originalOverflow;
            
            // Download image
            const timestamp = new Date().toISOString().slice(0, 10);
            const filename = `alphy-ai-screenshot-${timestamp}.png`;
            
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.showSuccessMessage('Screenshot saved successfully!');
                setTimeout(() => this.closeModal('share-modal'), 1500);
            });
            
        } catch (error) {
            console.error('❌ Screenshot error:', error);
            this.showSuccessMessage('Screenshot failed. Please try again.', true);
        } finally {
            this.showLoading(false);
        }
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
                content: text.trim(),
                timestamp: time
            });
        });
        
        return messages;
    }

    /**
     * Télécharger en TXT
     */
    async downloadTextFile(messages, filename) {
        let content = `ALPHY AI - FINANCIAL ASSISTANT CONVERSATION\n`;
        content += `${'='.repeat(60)}\n`;
        content += `Export Date: ${new Date().toLocaleString()}\n`;
        content += `Total Messages: ${messages.length}\n`;
        content += `${'='.repeat(60)}\n\n`;
        
        messages.forEach((msg, index) => {
            content += `[${index + 1}] ${msg.role.toUpperCase()}\n`;
            content += `${'-'.repeat(60)}\n`;
            content += `${msg.content}\n`;
            if (msg.timestamp) content += `Time: ${msg.timestamp}\n`;
            content += `\n`;
        });
        
        content += `\n${'='.repeat(60)}\n`;
        content += `Generated by AlphaVault AI - https://alphavault-ai.com\n`;
        
        this.downloadFile(content, `${filename}.txt`, 'text/plain');
    }

    /**
     * Télécharger en JSON
     */
    async downloadJSONFile(messages, filename) {
        const data = {
            platform: 'Alphy AI - Financial Assistant',
            version: '2.0',
            exportDate: new Date().toISOString(),
            totalMessages: messages.length,
            messages: messages,
            metadata: {
                url: window.location.href,
                userAgent: navigator.userAgent
            }
        };
        
        const content = JSON.stringify(data, null, 2);
        this.downloadFile(content, `${filename}.json`, 'application/json');
    }

    /**
     * ✅ NOUVEAU : Télécharger en PDF (avec jsPDF)
     */
    async downloadPDFFile(messages, filename) {
        if (typeof window.jspdf === 'undefined') {
            throw new Error('jsPDF library not loaded');
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Configuration
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const maxWidth = pageWidth - 2 * margin;
        let yPosition = margin;
        
        // Header
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Alphy AI Conversation', margin, yPosition);
        
        yPosition += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Export Date: ${new Date().toLocaleString()}`, margin, yPosition);
        
        yPosition += 5;
        doc.text(`Total Messages: ${messages.length}`, margin, yPosition);
        
        yPosition += 10;
        doc.setDrawColor(102, 126, 234);
        doc.setLineWidth(0.5);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        
        yPosition += 10;
        
        // Messages
        messages.forEach((msg, index) => {
            // Check if we need a new page
            if (yPosition > pageHeight - 40) {
                doc.addPage();
                yPosition = margin;
            }
            
            // Role header
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            
            if (msg.role === 'user') {
                doc.setTextColor(59, 130, 246);
                doc.text(`👤 USER`, margin, yPosition);
            } else {
                doc.setTextColor(102, 126, 234);
                doc.text(`🤖 ASSISTANT`, margin, yPosition);
            }
            
            yPosition += 7;
            
            // Message content
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            
            const lines = doc.splitTextToSize(msg.content, maxWidth);
            lines.forEach(line => {
                if (yPosition > pageHeight - 20) {
                    doc.addPage();
                    yPosition = margin;
                }
                doc.text(line, margin, yPosition);
                yPosition += 5;
            });
            
            // Timestamp
            if (msg.timestamp) {
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(`Time: ${msg.timestamp}`, margin, yPosition);
                yPosition += 5;
            }
            
            yPosition += 5;
            
            // Separator line
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.2);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            
            yPosition += 7;
        });
        
        // Footer on last page
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(
                `Page ${i} of ${totalPages} | Generated by AlphaVault AI`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
        }
        
        // Save PDF
        doc.save(`${filename}.pdf`);
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
    }

    /**
     * Générer un ID de conversation
     */
    generateConversationId() {
        return 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Afficher/masquer le loading
     */
    showLoading(show) {
        const loading = document.getElementById('export-loading');
        if (loading) {
            loading.style.display = show ? 'flex' : 'none';
        }
    }

    /**
     * Afficher un message de succès
     */
    showSuccessMessage(message, isError = false) {
        const successMsg = document.getElementById('share-success-message');
        if (successMsg) {
            const icon = successMsg.querySelector('i');
            const text = successMsg.querySelector('span');
            
            if (icon) {
                icon.className = isError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
            }
            if (text) {
                text.textContent = message;
            }
            
            successMsg.style.display = 'flex';
            successMsg.style.background = isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)';
            successMsg.style.borderColor = isError ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)';
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
            enterBehavior: document.getElementById('enter-behavior-select')?.value,
            compactMode: document.getElementById('compact-mode-toggle')?.checked,
            showAvatars: document.getElementById('show-avatars-toggle')?.checked,
            desktopNotifications: document.getElementById('desktop-notifications-toggle')?.checked,
            soundAlerts: document.getElementById('sound-alerts-toggle')?.checked,
            emailDigest: document.getElementById('email-digest-toggle')?.checked,
            saveHistory: document.getElementById('save-history-toggle')?.checked,
            analytics: document.getElementById('analytics-toggle')?.checked
        };
        
        localStorage.setItem('alphyAISettings', JSON.stringify(settings));
        this.showSuccessMessage('Settings saved successfully!');
        
        setTimeout(() => {
            this.closeModal('settings-modal');
        }, 1000);
        
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
            if (settings.enterBehavior) document.getElementById('enter-behavior-select').value = settings.enterBehavior;
            
            // Toggles
            document.getElementById('auto-save-toggle').checked = settings.autoSave ?? true;
            document.getElementById('timestamps-toggle').checked = settings.timestamps ?? true;
            document.getElementById('compact-mode-toggle').checked = settings.compactMode ?? false;
            document.getElementById('show-avatars-toggle').checked = settings.showAvatars ?? true;
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
            this.showSuccessMessage('Settings reset successfully!');
            setTimeout(() => {
                location.reload();
            }, 1000);
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
            this.showSuccessMessage('All data cleared!');
            setTimeout(() => {
                location.reload();
            }, 1500);
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