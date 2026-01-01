/* ============================================
   CHAT-EVENT-MANAGER.JS v1.0
   🔧 Gestionnaire unique des événements de chat
   ✅ Évite les conflits entre private-chat et group-chat
   📎 Gestion centralisée des attachments
   ============================================ */

class ChatEventManager {
    constructor() {
        this.attachedFiles = [];
        this.MAX_FILES = 5;
        this.MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        this.activeMode = null; // 'private' ou 'group'
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) {
            console.warn('⚠ ChatEventManager already initialized');
            return;
        }

        console.log('🔧 Initializing ChatEventManager v1.0...');

        const messageInput = document.getElementById('chatMessageInput');
        const sendBtn = document.getElementById('chatSendBtn');
        const attachBtn = document.getElementById('attachBtn');
        const fileInput = document.getElementById('fileInput');

        // ✅ Événement ENTER pour envoyer
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSend();
                }
            });
        }

        // ✅ Événement CLICK sur bouton Send
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.handleSend());
        }

        // ✅ Événement CLICK sur bouton Attach
        if (attachBtn && fileInput) {
            attachBtn.addEventListener('click', () => {
                console.log('📎 Attach button clicked');
                fileInput.click();
            });

            fileInput.addEventListener('change', (e) => {
                console.log('📂 File input changed:', e.target.files);
                this.handleFileSelect(e);
            });
        }

        this.initialized = true;
        console.log('✅ ChatEventManager initialized');
    }

    activateFor(mode) {
        this.activeMode = mode;
        console.log(`🔄 ChatEventManager activated for: ${mode}`);
    }

    handleSend() {
        if (this.activeMode === 'private') {
            if (window.privateChat) {
                window.privateChat.sendMessage();
            }
        } else if (this.activeMode === 'group') {
            if (window.groupChat) {
                window.groupChat.sendMessage();
            }
        } else {
            console.warn('⚠ No active chat mode');
        }
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        
        console.log(`📂 Selected ${files.length} file(s)`);

        for (const file of files) {
            if (this.attachedFiles.length >= this.MAX_FILES) {
                console.warn(`⚠ Maximum ${this.MAX_FILES} files allowed`);
                break;
            }

            if (file.size > this.MAX_FILE_SIZE) {
                console.warn(`⚠ ${file.name} is too large (max 10MB)`);
                continue;
            }

            this.attachedFiles.push(file);
            console.log(`✅ Added file: ${file.name} (${this.formatFileSize(file.size)})`);
        }

        this.renderAttachmentPreview();
        event.target.value = ''; // Reset input
    }

    renderAttachmentPreview() {
        const preview = document.getElementById('attachmentPreview');
        if (!preview) {
            console.warn('⚠ attachmentPreview element not found');
            return;
        }

        if (this.attachedFiles.length === 0) {
            preview.style.display = 'none';
            preview.innerHTML = '';
            console.log('🧹 Preview cleared (no files)');
            return;
        }

        preview.style.display = 'block';

        const previewHTML = `
            <div class="attachment-preview-grid">
                ${this.attachedFiles.map((file, index) => {
                    const isImage = file.type.startsWith('image/');
                    const previewUrl = isImage ? URL.createObjectURL(file) : null;
                    const icon = this.getFileIcon(file.name);

                    return `
                        <div class="attachment-preview-item">
                            ${isImage 
                                ? `<img src="${previewUrl}" class="attachment-preview-img" alt="${file.name}">`
                                : `<div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(102, 126, 234, 0.1); padding: 8px;">
                                    <i class="${icon}" style="font-size: 2rem; color: #667eea; margin-bottom: 4px;"></i>
                                    <span style="font-size: 0.7rem; color: #667eea; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%;">${file.name}</span>
                                   </div>`
                            }
                            <button class="attachment-remove-btn" onclick="window.chatEventManager.removeFile(${index})" title="Remove">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        preview.innerHTML = previewHTML;
        console.log(`✅ Preview rendered (${this.attachedFiles.length} file(s))`);
    }

    removeFile(index) {
        const removed = this.attachedFiles.splice(index, 1);
        console.log(`🗑 Removed file: ${removed[0].name}`);
        this.renderAttachmentPreview();
    }

    getAttachedFiles() {
        return this.attachedFiles;
    }

    clearAttachments() {
        this.attachedFiles = [];
        this.renderAttachmentPreview();
        console.log('🧹 Attachments cleared');
    }

    getFileIcon(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const iconMap = {
            pdf: 'fas fa-file-pdf',
            doc: 'fas fa-file-word',
            docx: 'fas fa-file-word',
            xls: 'fas fa-file-excel',
            xlsx: 'fas fa-file-excel',
            ppt: 'fas fa-file-powerpoint',
            pptx: 'fas fa-file-powerpoint',
            zip: 'fas fa-file-archive',
            txt: 'fas fa-file-alt',
            csv: 'fas fa-file-csv'
        };
        return iconMap[ext] || 'fas fa-file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
}

// ✅ Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
    window.chatEventManager = new ChatEventManager();
    window.chatEventManager.initialize();
});

console.log('✅ chat-event-manager.js loaded (v1.0)');