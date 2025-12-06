/* ============================================
   CHATBOT MODALS - SHARE & SETTINGS
   Version 4.0 - FIREBASE EDITION + PDF PREMIUM
   ✅ PDF Export avec GRAPHIQUES (html2canvas + jsPDF)
   ✅ Formatage Ultra-Professionnel
   ✅ Capture automatique des Charts
   ✅ Firebase Integration
   ============================================ */

class ChatbotModals {
    constructor() {
        this.modals = {};
        this.db = null;
        this.currentUser = null;
        this.init();
    }

    async init() {
        console.log('🎭 Initializing Advanced Chatbot Modals (Firebase Edition)...');
        
        await this.waitForAuth();
        this.createModalsHTML();
        this.attachEventListeners();
        await this.loadSettings();
        
        console.log('✅ Advanced Modals initialized successfully!');
    }

    waitForAuth() {
        return new Promise((resolve) => {
            if (typeof firebase === 'undefined') {
                console.error('❌ Firebase not loaded!');
                resolve();
                return;
            }
            
            this.db = firebase.firestore();
            
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    this.currentUser = user;
                    console.log('✅ User authenticated:', user.email);
                } else {
                    console.log('⚠ No user authenticated');
                }
                resolve();
            });
        });
    }

    createModalsHTML() {
        const modalsContainer = document.createElement('div');
        modalsContainer.id = 'chatbot-modals-container';
        modalsContainer.innerHTML = `
            <!-- SHARE MODAL -->
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
                        
                        <div class="share-success-message" id="share-success-message" style="display: none;">
                            <i class="fas fa-check-circle"></i>
                            <span>Link copied to clipboard!</span>
                        </div>
                        
                        <div class="export-loading" id="export-loading" style="display: none;">
                            <div class="loading-spinner"></div>
                            <span>Generating PDF with charts...</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- SETTINGS MODAL -->
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
                                        <div class="setting-desc">Automatically save your chat history to Firebase</div>
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
                                        <div class="setting-desc">Store your chat history in Firebase Cloud</div>
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
                                        <div class="setting-desc">Delete all conversations and settings from Firebase</div>
                                    </div>
                                    <button class="setting-danger-btn" id="clear-data-btn">
                                        <i class="fas fa-trash-alt"></i>
                                        Clear Data
                                    </button>
                                </div>
                            </div>
                        </div>
                        
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

    attachEventListeners() {
        document.getElementById('share-btn')?.addEventListener('click', () => this.openModal('share-modal'));
        document.getElementById('settings-btn')?.addEventListener('click', () => this.openModal('settings-modal'));
        
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.currentTarget.dataset.modal;
                this.closeModal(modalId);
            });
        });
        
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                const modal = e.currentTarget.closest('.chatbot-modal');
                this.closeModal(modal.id);
            });
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
        
        document.getElementById('share-link-btn')?.addEventListener('click', () => this.shareViaLink());
        document.getElementById('share-email-btn')?.addEventListener('click', () => this.shareViaEmail());
        document.getElementById('share-export-btn')?.addEventListener('click', () => this.showExportOptions());
        document.getElementById('share-screenshot-btn')?.addEventListener('click', () => this.showScreenshotOptions());
        
        document.querySelectorAll('.export-format-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const format = e.currentTarget.dataset.format;
                if (format) {
                    this.exportConversation(format);
                }
            });
        });
        
        document.getElementById('screenshot-full')?.addEventListener('click', () => this.takeScreenshot('full'));
        document.getElementById('screenshot-visible')?.addEventListener('click', () => this.takeScreenshot('visible'));
        
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.currentTarget));
        });
        
        document.getElementById('save-settings-btn')?.addEventListener('click', () => this.saveSettings());
        document.getElementById('reset-settings-btn')?.addEventListener('click', () => this.resetSettings());
        document.getElementById('clear-data-btn')?.addEventListener('click', () => this.clearAllData());
        
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.addEventListener('click', (e) => this.changeTheme(e.currentTarget));
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            console.log(`📖 Modal opened: ${modalId}`);
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            
            const exportSelector = document.getElementById('export-format-selector');
            const screenshotOptions = document.getElementById('screenshot-options');
            if (exportSelector) exportSelector.style.display = 'none';
            if (screenshotOptions) screenshotOptions.style.display = 'none';
            
            console.log(`📕 Modal closed: ${modalId}`);
        }
    }

    closeAllModals() {
        document.querySelectorAll('.chatbot-modal.active').forEach(modal => {
            this.closeModal(modal.id);
        });
    }

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

    shareViaEmail() {
        const subject = encodeURIComponent('Check out this Alphy AI conversation');
        const body = encodeURIComponent(`I wanted to share this interesting conversation with Alphy AI:\n\n${window.location.href}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
        console.log('📧 Opening email client...');
    }

    showExportOptions() {
        const exportSelector = document.getElementById('export-format-selector');
        const screenshotOptions = document.getElementById('screenshot-options');
        
        if (screenshotOptions) screenshotOptions.style.display = 'none';
        
        if (exportSelector) {
            exportSelector.style.display = 'block';
            exportSelector.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

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
        
        const messages = await this.getConversationMessagesWithCharts();
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
     * ✅ ULTRA-OPTIMIZED PDF EXPORT WITH CHARTS
     */
    async downloadPDFFile(messages, filename) {
        if (typeof window.jspdf === 'undefined') {
            throw new Error('jsPDF library not loaded');
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            unit: 'pt',
            format: 'a4',
            compress: true
        });
        
        // Page dimensions
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 40;
        const maxWidth = pageWidth - 2 * margin;
        let yPos = margin;
        
        // Helper: Check if new page is needed
        const checkNewPage = (requiredSpace = 60) => {
            if (yPos + requiredSpace > pageHeight - margin - 40) {
                doc.addPage();
                yPos = margin;
                return true;
            }
            return false;
        };
        
        // ==================== HEADER ====================
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(102, 126, 234);
        doc.text('Alphy AI Conversation', margin, yPos);
        yPos += 30;
        
        // Subtitle
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Export Date: ${new Date().toLocaleString('en-US', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
        })}`, margin, yPos);
        yPos += 18;
        
        doc.text(`Total Messages: ${messages.length}`, margin, yPos);
        yPos += 25;
        
        // Separator
        doc.setDrawColor(102, 126, 234);
        doc.setLineWidth(2);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 35;
        
        // ==================== MESSAGES ====================
        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            
            checkNewPage(120);
            
            const isUser = msg.role === 'user';
            const headerHeight = 28;
            
            // Message header background
            if (isUser) {
                doc.setFillColor(59, 130, 246);
            } else {
                doc.setFillColor(102, 126, 234);
            }
            
            doc.roundedRect(margin, yPos - 18, maxWidth, headerHeight, 4, 4, 'F');
            
            // Role icon and text
            doc.setFontSize(13);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            
            if (isUser) {
                doc.text(`👤 USER`, margin + 12, yPos);
            } else {
                doc.text(`🤖 ASSISTANT`, margin + 12, yPos);
            }
            
            yPos += headerHeight;
            
            // Message content
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(30, 30, 30);
            
            const contentMargin = margin + 15;
            const contentWidth = maxWidth - 30;
            
            // Split content into paragraphs
            const paragraphs = msg.content.split('\n').filter(p => p.trim());
            
            for (let pIndex = 0; pIndex < paragraphs.length; pIndex++) {
                checkNewPage(40);
                
                const paragraph = paragraphs[pIndex].trim();
                const lines = doc.splitTextToSize(paragraph, contentWidth);
                
                for (const line of lines) {
                    if (checkNewPage(15)) {
                        // Continue on new page
                    }
                    doc.text(line, contentMargin, yPos);
                    yPos += 15;
                }
                
                // Space between paragraphs
                if (pIndex < paragraphs.length - 1) {
                    yPos += 8;
                }
            }
            
            yPos += 15;
            
            // ==================== CHART IMAGE ====================
            if (msg.chartImage) {
                checkNewPage(250);
                
                const imgWidth = maxWidth - 40;
                const imgHeight = 200;
                
                try {
                    doc.addImage(
                        msg.chartImage,
                        'PNG',
                        margin + 20,
                        yPos,
                        imgWidth,
                        imgHeight,
                        undefined,
                        'FAST'
                    );
                    
                    yPos += imgHeight + 20;
                    
                    console.log(`✅ Chart added for message ${i + 1}`);
                } catch (error) {
                    console.error(`❌ Failed to add chart for message ${i + 1}:`, error);
                }
            }
            
            // Timestamp
            if (msg.timestamp) {
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.setFont('helvetica', 'italic');
                doc.text(`Time: ${msg.timestamp}`, contentMargin, yPos);
                yPos += 15;
            }
            
            yPos += 10;
            
            // Separator between messages
            if (i < messages.length - 1) {
                doc.setDrawColor(220, 220, 220);
                doc.setLineWidth(0.5);
                doc.line(margin, yPos, pageWidth - margin, yPos);
                yPos += 25;
            }
        }
        
        // ==================== FOOTER ON ALL PAGES ====================
        const totalPages = doc.internal.getNumberOfPages();
        
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            
            // Footer line
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.5);
            doc.line(margin, pageHeight - 35, pageWidth - margin, pageHeight - 35);
            
            // Footer text
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(150, 150, 150);
            
            const footerText = `Page ${i} of ${totalPages} | Generated by AlphaVault AI - alphavault-ai.com`;
            const textWidth = doc.getTextWidth(footerText);
            doc.text(footerText, (pageWidth - textWidth) / 2, pageHeight - 18);
        }
        
        // Save PDF
        doc.save(`${filename}.pdf`);
        console.log('✅ PDF with charts generated successfully!');
    }

    /**
     * ✅ GET MESSAGES WITH CHART IMAGES
     */
    async getConversationMessagesWithCharts() {
        const messagesContainer = document.getElementById('chatbot-messages-content');
        const messages = [];
        
        if (!messagesContainer) {
            console.error('❌ Messages container not found');
            return messages;
        }
        
        const messageElements = messagesContainer.querySelectorAll('.message');
        
        for (const msg of messageElements) {
            const isUser = msg.classList.contains('user-message');
            const text = msg.querySelector('.message-text')?.textContent || '';
            const time = msg.querySelector('.message-time')?.textContent || '';
            
            const messageData = {
                role: isUser ? 'user' : 'assistant',
                content: text.trim(),
                timestamp: time,
                chartImage: null
            };
            
            // ✅ DETECT AND CAPTURE CHARTS
            const chartElement = msg.querySelector('canvas, .chart-container, [id*="chart"]');
            
            if (chartElement && typeof html2canvas !== 'undefined') {
                try {
                    console.log(`📊 Capturing chart for message...`);
                    
                    const canvas = await html2canvas(chartElement, {
                        backgroundColor: '#ffffff',
                        scale: 2,
                        logging: false,
                        useCORS: true,
                        allowTaint: true
                    });
                    
                    messageData.chartImage = canvas.toDataURL('image/png');
                    console.log(`✅ Chart captured successfully`);
                } catch (error) {
                    console.error('❌ Chart capture failed:', error);
                }
            }
            
            messages.push(messageData);
        }
        
        console.log(`📚 Processed ${messages.length} messages`);
        return messages;
    }

    /**
     * LEGACY: Get messages without charts (for TXT/JSON export)
     */
    getConversationMessages() {
        const messagesContainer = document.getElementById('chatbot-messages-content');
        const messages = [];
        
        messagesContainer?.querySelectorAll('.message').forEach(msg => {
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
            
            const originalOverflow = container.style.overflow;
            container.style.overflow = 'visible';
            
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
            
            container.style.overflow = originalOverflow;
            
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
     * Télécharger en TXT
     */
    async downloadTextFile(messages, filename) {
        let content = `ALPHY AI - FINANCIAL ASSISTANT CONVERSATION\n`;
        content += `${'='.repeat(70)}\n`;
        content += `Export Date: ${new Date().toLocaleString()}\n`;
        content += `Total Messages: ${messages.length}\n`;
        content += `${'='.repeat(70)}\n\n`;
        
        messages.forEach((msg, index) => {
            content += `[${index + 1}] ${msg.role.toUpperCase()}\n`;
            content += `${'-'.repeat(70)}\n`;
            content += `${msg.content}\n`;
            if (msg.timestamp) content += `Time: ${msg.timestamp}\n`;
            content += `\n`;
        });
        
        content += `\n${'='.repeat(70)}\n`;
        content += `Generated by AlphaVault AI - https://alphavault-ai.com\n`;
        
        this.downloadFile(content, `${filename}.txt`, 'text/plain');
    }

    /**
     * Télécharger en JSON
     */
    async downloadJSONFile(messages, filename) {
        const data = {
            platform: 'Alphy AI - Financial Assistant',
            version: '4.0',
            exportDate: new Date().toISOString(),
            totalMessages: messages.length,
            messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp
            })),
            metadata: {
                url: window.location.href,
                userAgent: navigator.userAgent
            }
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
    }

    generateConversationId() {
        return 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    showLoading(show) {
        const loading = document.getElementById('export-loading');
        if (loading) {
            loading.style.display = show ? 'flex' : 'none';
        }
    }

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

    switchTab(tabElement) {
        const targetTab = tabElement.dataset.tab;
        
        document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
        tabElement.classList.add('active');
        
        document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
        document.querySelector(`[data-panel="${targetTab}"]`)?.classList.add('active');
    }

    changeTheme(themeBtn) {
        const theme = themeBtn.dataset.theme;
        
        document.querySelectorAll('.theme-option').forEach(btn => btn.classList.remove('active'));
        themeBtn.classList.add('active');
        
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else if (theme === 'light') {
            document.body.classList.remove('dark-mode');
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.classList.toggle('dark-mode', prefersDark);
        }
        
        console.log(`🎨 Theme changed to: ${theme}`);
    }

    /**
     * ✅ FIREBASE: Sauvegarder les paramètres
     */
    async saveSettings() {
        if (!this.currentUser) {
            this.showSuccessMessage('Please login to save settings', true);
            return;
        }
        
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
            analytics: document.getElementById('analytics-toggle')?.checked,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        try {
            await this.db.collection('users').doc(this.currentUser.uid).collection('settings').doc('chatbot').set(settings);
            
            this.showSuccessMessage('Settings saved to Firebase!');
            console.log('💾 Settings saved to Firebase:', settings);
            
            setTimeout(() => {
                this.closeModal('settings-modal');
            }, 1000);
        } catch (error) {
            console.error('❌ Firebase save error:', error);
            this.showSuccessMessage('Failed to save settings', true);
        }
    }

    /**
     * ✅ FIREBASE: Charger les paramètres
     */
    async loadSettings() {
        if (!this.currentUser) {
            console.log('⚠ No user logged in, using defaults');
            return;
        }
        
        try {
            const doc = await this.db.collection('users').doc(this.currentUser.uid).collection('settings').doc('chatbot').get();
            
            if (!doc.exists) {
                console.log('ℹ No settings found in Firebase, using defaults');
                return;
            }
            
            const settings = doc.data();
            
            // Apply settings to UI
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
            
            console.log('⚙ Settings loaded from Firebase');
        } catch (error) {
            console.error('❌ Firebase load error:', error);
        }
    }

    /**
     * ✅ FIREBASE: Réinitialiser les paramètres
     */
    async resetSettings() {
        if (!confirm('Are you sure you want to reset all settings to defaults?')) {
            return;
        }
        
        if (!this.currentUser) {
            this.showSuccessMessage('Please login to reset settings', true);
            return;
        }
        
        try {
            await this.db.collection('users').doc(this.currentUser.uid).collection('settings').doc('chatbot').delete();
            
            this.showSuccessMessage('Settings reset successfully!');
            
            setTimeout(() => {
                location.reload();
            }, 1000);
            
            console.log('🔄 Settings reset in Firebase');
        } catch (error) {
            console.error('❌ Firebase reset error:', error);
            this.showSuccessMessage('Failed to reset settings', true);
        }
    }

    /**
     * ✅ FIREBASE: Effacer toutes les données
     */
    async clearAllData() {
        if (!confirm('⚠ This will delete ALL your conversations and settings from Firebase. This action cannot be undone. Are you sure?')) {
            return;
        }
        
        if (!this.currentUser) {
            this.showSuccessMessage('Please login to clear data', true);
            return;
        }
        
        try {
            const batch = this.db.batch();
            
            // Delete settings
            const settingsRef = this.db.collection('users').doc(this.currentUser.uid).collection('settings').doc('chatbot');
            batch.delete(settingsRef);
            
            // Delete conversations
            const conversationsSnapshot = await this.db.collection('users').doc(this.currentUser.uid).collection('conversations').get();
            
            conversationsSnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            await batch.commit();
            
            this.showSuccessMessage('All data cleared from Firebase!');
            
            setTimeout(() => {
                location.reload();
            }, 1500);
            
            console.log('🗑 All data cleared from Firebase');
        } catch (error) {
            console.error('❌ Firebase clear error:', error);
            this.showSuccessMessage('Failed to clear data', true);
        }
    }

    /**
     * ✅ FIREBASE: Sauvegarder une conversation
     */
    async saveConversation(messages, conversationId = null) {
        if (!this.currentUser) {
            console.log('⚠ No user logged in, cannot save conversation');
            return null;
        }
        
        const settings = await this.getSettings();
        if (!settings.saveHistory) {
            console.log('ℹ Save history disabled in settings');
            return null;
        }
        
        try {
            const id = conversationId || this.generateConversationId();
            
            const conversationData = {
                id: id,
                messages: messages,
                createdAt: conversationId ? firebase.firestore.FieldValue.serverTimestamp() : firebase.firestore.Timestamp.now(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                messageCount: messages.length
            };
            
            await this.db.collection('users').doc(this.currentUser.uid).collection('conversations').doc(id).set(conversationData);
            
            console.log('💾 Conversation saved to Firebase:', id);
            return id;
        } catch (error) {
            console.error('❌ Firebase conversation save error:', error);
            return null;
        }
    }

    /**
     * ✅ FIREBASE: Charger les conversations
     */
    async loadConversations() {
        if (!this.currentUser) {
            console.log('⚠ No user logged in, cannot load conversations');
            return [];
        }
        
        try {
            const snapshot = await this.db.collection('users')
                .doc(this.currentUser.uid)
                .collection('conversations')
                .orderBy('updatedAt', 'desc')
                .limit(50)
                .get();
            
            const conversations = [];
            snapshot.forEach(doc => {
                conversations.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`📚 Loaded ${conversations.length} conversations from Firebase`);
            return conversations;
        } catch (error) {
            console.error('❌ Firebase conversations load error:', error);
            return [];
        }
    }

    /**
     * Helper: Get current settings
     */
    async getSettings() {
        if (!this.currentUser) {
            return { saveHistory: false };
        }
        
        try {
            const doc = await this.db.collection('users').doc(this.currentUser.uid).collection('settings').doc('chatbot').get();
            return doc.exists ? doc.data() : { saveHistory: true };
        } catch (error) {
            return { saveHistory: false };
        }
    }
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    window.chatbotModals = new ChatbotModals();
});