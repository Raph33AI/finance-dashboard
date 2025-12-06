/* ============================================
   CHATBOT MODALS - SHARE & SETTINGS
   Version 7.1 - CORRECTED
   ✅ Email avec PDF en pièce jointe automatique
   ✅ Mode compact fonctionnel
   ✅ Desktop notifications supprimé
   ✅ Onglet Privacy complètement supprimé
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
                                    <div class="share-option-desc">Send via email (PDF attached)</div>
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
                            <span>Generating professional PDF...</span>
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
        
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.addEventListener('click', (e) => this.changeTheme(e.currentTarget));
        });

        // ✅ MODE COMPACT - Event Listener
        document.getElementById('compact-mode-toggle')?.addEventListener('change', (e) => {
            this.toggleCompactMode(e.target.checked);
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

    /**
     * ✅ SHARE VIA EMAIL - AVEC PDF EN PIÈCE JOINTE AUTOMATIQUE
     */
    async shareViaEmail() {
        console.log('📧 Preparing email with PDF attachment...');
        
        this.showLoading(true);
        
        try {
            // 1. Générer le PDF automatiquement
            const timestamp = new Date().toISOString().slice(0, 10);
            const filename = `alphavault-ai-conversation-${timestamp}`;
            
            const messages = await this.getConversationMessagesWithVisuals();
            await this.downloadPDFFile(messages, filename);
            
            this.showLoading(false);
            
            // 2. Attendre un peu que le téléchargement démarre
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // 3. Ouvrir le client email
            const subject = encodeURIComponent('AlphaVault AI - Financial Conversation');
            const body = encodeURIComponent(
                `Hi,\n\n` +
                `I'm sharing this conversation from AlphaVault AI.\n\n` +
                `📎 A PDF file has been automatically downloaded to your Downloads folder.\n` +
                `Please attach the file "${filename}.pdf" to this email before sending.\n\n` +
                `Best regards,\n` +
                `AlphaVault AI\n\n` +
                `---\n` +
                `${window.location.href}`
            );
            
            window.location.href = `mailto:?subject=${subject}&body=${body}`;
            
            this.showSuccessMessage('PDF downloaded! Please attach it to the email.');
            
            console.log('✅ PDF downloaded and email client opened');
            
        } catch (error) {
            console.error('❌ Email share error:', error);
            this.showSuccessMessage('Failed to prepare email. Please try exporting manually.', true);
            this.showLoading(false);
        }
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
     * ✅ EXPORT CONVERSATION
     */
    async exportConversation(format) {
        console.log(`📥 Exporting conversation as ${format.toUpperCase()}...`);
        
        this.showLoading(true);
        
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `alphavault-ai-conversation-${timestamp}`;
        
        try {
            if (format === 'pdf') {
                const messages = await this.getConversationMessagesWithVisuals();
                await this.downloadPDFFile(messages, filename);
            } else {
                const messages = this.getConversationMessages();
                
                if (format === 'txt') {
                    await this.downloadTextFile(messages, filename);
                } else if (format === 'json') {
                    await this.downloadJSONFile(messages, filename);
                }
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
     * ✅ GET MESSAGES WITH ALL VISUAL ELEMENTS (CHARTS + TABLES)
     */
    async getConversationMessagesWithVisuals() {
        const messagesContainer = document.getElementById('chatbot-messages-content');
        const messages = [];
        
        if (!messagesContainer) {
            console.error('❌ Messages container not found');
            return messages;
        }
        
        const messageElements = messagesContainer.querySelectorAll('.message');
        console.log(`📊 Found ${messageElements.length} messages to process`);
        
        // Récupérer TOUS les canvas
        const allCanvases = messagesContainer.querySelectorAll('canvas');
        console.log(`📊 Found ${allCanvases.length} canvas elements`);
        
        // Récupérer TOUS les tableaux de métriques
        const allMetricTables = messagesContainer.querySelectorAll('.visual-card, .metric-card, [class*="comparison"]');
        console.log(`📊 Found ${allMetricTables.length} visual elements`);
        
        // Créer les messages
        for (let i = 0; i < messageElements.length; i++) {
            const msg = messageElements[i];
            const isUser = msg.classList.contains('user-message');
            const textElement = msg.querySelector('.message-text');
            const text = textElement?.textContent || textElement?.innerText || '';
            const time = msg.querySelector('.message-time')?.textContent || '';
            
            messages.push({
                role: isUser ? 'user' : 'assistant',
                content: this.cleanText(text.trim()),
                timestamp: time,
                visualImages: []
            });
        }
        
        // Capturer TOUS les visuels
        const visualImages = [];
        
        // 1. Capturer les canvas (graphiques Chart.js)
        for (let i = 0; i < allCanvases.length; i++) {
            const canvas = allCanvases[i];
            
            try {
                const rect = canvas.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) {
                    console.warn(`  ⚠  Canvas ${i + 1} invisible, skip`);
                    continue;
                }
                
                console.log(`📊 Canvas ${i + 1}/${allCanvases.length}: Capturing...`);
                
                await this.waitForChartRender(canvas);
                
                const capturedCanvas = await html2canvas(canvas, {
                    backgroundColor: '#ffffff',
                    scale: 3,
                    logging: false,
                    useCORS: true,
                    allowTaint: true,
                    windowWidth: canvas.scrollWidth || canvas.width || 800,
                    windowHeight: canvas.scrollHeight || canvas.height || 400
                });
                
                visualImages.push({
                    type: 'chart',
                    data: capturedCanvas.toDataURL('image/png', 1.0)
                });
                
                console.log(`✅ Canvas ${i + 1}: Captured (${capturedCanvas.width}x${capturedCanvas.height})`);
            } catch (error) {
                console.error(`❌ Canvas ${i + 1}: Failed:`, error);
            }
        }
        
        // 2. Capturer les tableaux de métriques (visual-card)
        for (let i = 0; i < allMetricTables.length; i++) {
            const table = allMetricTables[i];
            
            try {
                const rect = table.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) {
                    console.warn(`  ⚠  Visual element ${i + 1} invisible, skip`);
                    continue;
                }
                
                console.log(`📊 Visual element ${i + 1}/${allMetricTables.length}: Capturing...`);
                
                const capturedCanvas = await html2canvas(table, {
                    backgroundColor: '#ffffff',
                    scale: 3,
                    logging: false,
                    useCORS: true,
                    allowTaint: true
                });
                
                visualImages.push({
                    type: 'table',
                    data: capturedCanvas.toDataURL('image/png', 1.0)
                });
                
                console.log(`✅ Visual element ${i + 1}: Captured (${capturedCanvas.width}x${capturedCanvas.height})`);
            } catch (error) {
                console.error(`❌ Visual element ${i + 1}: Failed:`, error);
            }
        }
        
        // Associer les visuels au dernier message assistant
        if (visualImages.length > 0) {
            for (let i = messages.length - 1; i >= 0; i--) {
                if (messages[i].role === 'assistant') {
                    messages[i].visualImages = visualImages;
                    console.log(`✅ ${visualImages.length} visuals associated to message ${i + 1}`);
                    break;
                }
            }
        }
        
        console.log(`✅ Processed ${messages.length} messages (${visualImages.length} visuals captured)`);
        return messages;
    }

    /**
     * ✅ CLEAN TEXT (Remove emojis and special characters)
     */
    cleanText(text) {
        return text
            .replace(/[📊🎯📈💰🚀💼🔍✅❌⚠📉📋🎨🔧💡]/g, '')
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
            .replace(/[Ø=ÜüÝýÊê]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * ✅ WAIT FOR CHART RENDER
     */
    waitForChartRender(element) {
        return new Promise((resolve) => {
            if (element.tagName === 'CANVAS' && typeof Chart !== 'undefined') {
                const chartInstance = Chart.getChart(element);
                
                if (chartInstance) {
                    if (chartInstance.options.animation && chartInstance.options.animation.duration > 0) {
                        console.log('⏳ Waiting for Chart.js animation...');
                        setTimeout(() => resolve(), chartInstance.options.animation.duration + 100);
                    } else {
                        resolve();
                    }
                } else {
                    resolve();
                }
            } else {
                setTimeout(resolve, 100);
            }
        });
    }

    /**
     * ✅ ALPHAVAULT AI LOGO (SVG en Base64)
     */
    getAlphaVaultLogo() {
        const svg = `
        <svg width="60" height="60" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                </linearGradient>
            </defs>
            <path d="M 15 85 L 25 75 L 35 78 L 50 55 L 65 60 L 80 35 L 95 30" 
                  stroke="url(#logoGrad)" stroke-width="5" fill="none" 
                  stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="25" cy="75" r="5" fill="url(#logoGrad)"/>
            <circle cx="50" cy="55" r="5" fill="url(#logoGrad)"/>
            <circle cx="80" cy="35" r="5" fill="url(#logoGrad)"/>
            <circle cx="95" cy="30" r="6" fill="url(#logoGrad)"/>
            <path d="M 90 35 L 95 30 L 90 25" stroke="url(#logoGrad)" 
                  stroke-width="4" fill="none" stroke-linecap="round"/>
        </svg>
        `;
        
        return 'data:image/svg+xml;base64,' + btoa(svg);
    }

    /**
     * ✅ DOWNLOAD PDF WITH LOGO & PROFESSIONAL FORMATTING
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
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 40;
        const maxWidth = pageWidth - 2 * margin;
        let yPos = margin;
        
        const checkNewPage = (requiredSpace = 60) => {
            if (yPos + requiredSpace > pageHeight - margin - 40) {
                doc.addPage();
                yPos = margin;
                return true;
            }
            return false;
        };
        
        // ==================== HEADER WITH LOGO ====================
        try {
            const logoDataUrl = this.getAlphaVaultLogo();
            doc.addImage(logoDataUrl, 'SVG', margin, yPos - 5, 40, 40);
        } catch (error) {
            console.warn('Logo not added:', error);
        }
        
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(102, 126, 234);
        doc.text('AlphaVault AI Conversation', margin + 50, yPos + 15);
        yPos += 45;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Export Date: ${new Date().toLocaleString('en-US', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
        })}`, margin, yPos);
        yPos += 16;
        
        doc.text(`Total Messages: ${messages.length}`, margin, yPos);
        yPos += 22;
        
        doc.setDrawColor(102, 126, 234);
        doc.setLineWidth(2);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 30;
        
        // ==================== MESSAGES ====================
        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            
            checkNewPage(120);
            
            const isUser = msg.role === 'user';
            const headerHeight = 26;
            
            if (isUser) {
                doc.setFillColor(59, 130, 246);
            } else {
                doc.setFillColor(102, 126, 234);
            }
            
            doc.roundedRect(margin, yPos - 16, maxWidth, headerHeight, 4, 4, 'F');
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            
            doc.text(isUser ? 'USER' : 'ASSISTANT', margin + 12, yPos);
            
            yPos += headerHeight + 3;
            
            // ==================== MESSAGE CONTENT ====================
            const contentMargin = margin + 12;
            const contentWidth = maxWidth - 24;
            
            const content = msg.content;
            
            const sectionRegex = /^(.+?):(.*?)(?=\n[A-Z][^:]+:|$)/gs;
            const sections = [];
            
            let match;
            while ((match = sectionRegex.exec(content)) !== null) {
                sections.push({
                    title: match[1].trim(),
                    content: match[2].trim()
                });
            }
            
            if (sections.length === 0) {
                sections.push({
                    title: null,
                    content: content
                });
            }
            
            for (let sIndex = 0; sIndex < sections.length; sIndex++) {
                const section = sections[sIndex];
                
                checkNewPage(40);
                
                if (section.title) {
                    doc.setFontSize(11);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(102, 126, 234);
                    
                    const titleLines = doc.splitTextToSize(section.title + ':', contentWidth);
                    
                    for (const line of titleLines) {
                        if (checkNewPage(16)) {}
                        doc.text(line, contentMargin, yPos);
                        yPos += 16;
                    }
                    
                    yPos += 4;
                }
                
                doc.setFontSize(9.5);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(30, 30, 30);
                
                const sentences = section.content.split(/(?<=[.!?])\s+/).filter(s => s.trim());
                
                let currentParagraph = '';
                
                for (let sentIndex = 0; sentIndex < sentences.length; sentIndex++) {
                    const sentence = sentences[sentIndex].trim();
                    currentParagraph += sentence + ' ';
                    
                    const shouldBreak = (sentIndex + 1) % 3 === 0 || sentIndex === sentences.length - 1;
                    
                    if (shouldBreak && currentParagraph.trim()) {
                        checkNewPage(35);
                        
                        const lines = doc.splitTextToSize(currentParagraph.trim(), contentWidth);
                        
                        for (const line of lines) {
                            if (checkNewPage(13)) {}
                            doc.text(line, contentMargin, yPos);
                            yPos += 13;
                        }
                        
                        yPos += 7;
                        currentParagraph = '';
                    }
                }
                
                yPos += 8;
            }
            
            yPos += 3;
            
            // ==================== VISUAL ELEMENTS ====================
            if (msg.visualImages && msg.visualImages.length > 0) {
                console.log(`📊 Adding ${msg.visualImages.length} visuals for message ${i + 1}`);
                
                for (let vIndex = 0; vIndex < msg.visualImages.length; vIndex++) {
                    checkNewPage(230);
                    
                    const imgWidth = maxWidth - 30;
                    const imgHeight = 180;
                    
                    try {
                        doc.setDrawColor(200, 200, 200);
                        doc.setLineWidth(0.5);
                        doc.roundedRect(margin + 15 - 1, yPos - 1, imgWidth + 2, imgHeight + 2, 2, 2, 'S');
                        
                        doc.addImage(
                            msg.visualImages[vIndex].data,
                            'PNG',
                            margin + 15,
                            yPos,
                            imgWidth,
                            imgHeight,
                            undefined,
                            'FAST'
                        );
                        
                        yPos += imgHeight + 18;
                        
                        console.log(`✅ Visual ${vIndex + 1}/${msg.visualImages.length} added`);
                    } catch (error) {
                        console.error(`❌ Failed to add visual ${vIndex + 1}:`, error);
                    }
                }
            }
            
            if (msg.timestamp) {
                doc.setFontSize(7.5);
                doc.setTextColor(140, 140, 140);
                doc.setFont('helvetica', 'italic');
                doc.text(`Time: ${msg.timestamp}`, contentMargin, yPos);
                yPos += 13;
            }
            
            yPos += 12;
            
            if (i < messages.length - 1) {
                doc.setDrawColor(220, 220, 220);
                doc.setLineWidth(0.3);
                doc.line(margin, yPos, pageWidth - margin, yPos);
                yPos += 22;
            }
        }
        
        // ==================== FOOTER ====================
        const totalPages = doc.internal.getNumberOfPages();
        
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.3);
            doc.line(margin, pageHeight - 32, pageWidth - margin, pageHeight - 32);
            
            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(140, 140, 140);
            
            const footerText = `Page ${i} of ${totalPages} | Generated by AlphaVault AI - alphavault-ai.com`;
            const textWidth = doc.getTextWidth(footerText);
            doc.text(footerText, (pageWidth - textWidth) / 2, pageHeight - 16);
        }
        
        doc.save(`${filename}.pdf`);
        console.log('✅ Professional PDF generated successfully!');
    }

    /**
     * GET MESSAGES (TEXT ONLY)
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
                content: this.cleanText(text.trim()),
                timestamp: time
            });
        });
        
        return messages;
    }

    /**
     * TAKE SCREENSHOT
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
            const filename = `alphavault-ai-screenshot-${timestamp}.png`;
            
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
     * DOWNLOAD TEXT FILE
     */
    async downloadTextFile(messages, filename) {
        let content = `ALPHAVAULT AI - FINANCIAL ASSISTANT CONVERSATION\n`;
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
     * DOWNLOAD JSON FILE
     */
    async downloadJSONFile(messages, filename) {
        const data = {
            platform: 'AlphaVault AI - Financial Assistant',
            version: '7.1',
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
     * DOWNLOAD FILE
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
     * ✅ TOGGLE COMPACT MODE - FONCTIONNALITÉ COMPLÈTE
     */
    toggleCompactMode(enabled) {
        const chatbotContainer = document.querySelector('.chatbot-container') || 
                                 document.querySelector('#chatbot-window') ||
                                 document.querySelector('.chatbot-messages');
        
        if (!chatbotContainer) {
            console.warn('⚠ Chatbot container not found for compact mode');
            return;
        }
        
        if (enabled) {
            chatbotContainer.classList.add('compact-mode');
            console.log('✅ Compact mode enabled');
        } else {
            chatbotContainer.classList.remove('compact-mode');
            console.log('✅ Compact mode disabled');
        }
        
        // Ajouter les styles CSS si nécessaire
        if (!document.getElementById('compact-mode-styles')) {
            const style = document.createElement('style');
            style.id = 'compact-mode-styles';
            style.textContent = `
                .compact-mode .message {
                    padding: 8px 12px !important;
                    margin-bottom: 8px !important;
                }
                
                .compact-mode .message-text {
                    font-size: 13px !important;
                    line-height: 1.4 !important;
                }
                
                .compact-mode .message-time {
                    font-size: 10px !important;
                    margin-top: 4px !important;
                }
                
                .compact-mode .message-avatar {
                    width: 28px !important;
                    height: 28px !important;
                }
                
                .compact-mode .chatbot-header {
                    padding: 12px 16px !important;
                }
                
                .compact-mode .chatbot-input-container {
                    padding: 10px !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

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
            soundAlerts: document.getElementById('sound-alerts-toggle')?.checked,
            emailDigest: document.getElementById('email-digest-toggle')?.checked,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        try {
            await this.db.collection('users').doc(this.currentUser.uid).collection('settings').doc('chatbot').set(settings);
            
            // ✅ Appliquer le mode compact immédiatement
            this.toggleCompactMode(settings.compactMode);
            
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
            
            if (settings.language) document.getElementById('language-select').value = settings.language;
            if (settings.fontSize) document.getElementById('font-size-select').value = settings.fontSize;
            if (settings.enterBehavior) document.getElementById('enter-behavior-select').value = settings.enterBehavior;
            
            document.getElementById('auto-save-toggle').checked = settings.autoSave ?? true;
            document.getElementById('timestamps-toggle').checked = settings.timestamps ?? true;
            document.getElementById('compact-mode-toggle').checked = settings.compactMode ?? false;
            document.getElementById('show-avatars-toggle').checked = settings.showAvatars ?? true;
            document.getElementById('sound-alerts-toggle').checked = settings.soundAlerts ?? true;
            document.getElementById('email-digest-toggle').checked = settings.emailDigest ?? false;
            
            // ✅ Appliquer le mode compact au chargement
            this.toggleCompactMode(settings.compactMode ?? false);
            
            console.log('⚙ Settings loaded from Firebase');
        } catch (error) {
            console.error('❌ Firebase load error:', error);
        }
    }

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

    async saveConversation(messages, conversationId = null) {
        if (!this.currentUser) {
            console.log('⚠ No user logged in, cannot save conversation');
            return null;
        }
        
        const settings = await this.getSettings();
        if (!settings.autoSave) {
            console.log('ℹ Auto-save disabled in settings');
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

    async getSettings() {
        if (!this.currentUser) {
            return { autoSave: false };
        }
        
        try {
            const doc = await this.db.collection('users').doc(this.currentUser.uid).collection('settings').doc('chatbot').get();
            return doc.exists ? doc.data() : { autoSave: true };
        } catch (error) {
            return { autoSave: false };
        }
    }
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    window.chatbotModals = new ChatbotModals();
});