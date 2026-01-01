/* ============================================
   GROUP-CHAT.JS v1.1
   💬 Gestion complète des conversations de groupe
   ✅ Envoi/réception de messages groupe
   ✅ Gestion des membres (ajouter/retirer)
   ✅ Typing indicators multi-users
   ✅ Quitter le groupe
   ⚠ SANS ALERT() - Console uniquement
   ============================================ */

class GroupChat {
    constructor() {
        this.currentUser = null;
        this.currentGroup = null;
        this.currentGroupId = null;
        this.messagesListener = null;
        this.attachedFiles = [];
        this.MAX_FILES = 5;
        this.MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        
        this.R2_WORKER_URL = 'https://alphavault-image-storage.raphnardone.workers.dev';
    }

    async initialize() {
        console.log('👥 Initializing Group Chat v1.1...');
        
        this.auth.onAuthStateChanged((user) => {
            this.currentUser = user;
            if (user) {
                console.log('✅ Group chat user authenticated:', user.email);
                this.setupEventListeners();
            }
        });
    }

    setupEventListeners() {
        const messageInput = document.getElementById('chatMessageInput');
        const sendBtn = document.getElementById('chatSendBtn');
        const attachBtn = document.getElementById('attachBtn');
        const fileInput = document.getElementById('fileInput');

        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        if (attachBtn && fileInput) {
            attachBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }
    }

    async openGroup(groupId, groupData) {
        console.log('💬 Opening GROUP chat:', groupData.name);

        this.currentGroupId = groupId;
        this.currentGroup = groupData;

        const emptyState = document.getElementById('chatEmptyState');
        const chatActive = document.getElementById('chatActive');

        if (emptyState) emptyState.style.display = 'none';
        if (chatActive) chatActive.style.display = 'flex';

        // ✅ CORRECTION : Activer après un délai pour s'assurer que chatEventManager est prêt
        setTimeout(() => {
            if (window.chatEventManager) {
                window.chatEventManager.activateFor('group');
                console.log('✅ ChatEventManager activated for GROUP chat');
            } else {
                console.error('❌ ChatEventManager not found!');
            }
        }, 100);

        await this.renderGroupHeader();
        await this.loadMessages();
        await this.markAsRead();
        
        this.setupMobileBackButton();
    }

    setupMobileBackButton() {
        setTimeout(() => {
            const backBtn = document.querySelector('.chat-back-btn');
            
            if (backBtn) {
                const newBackBtn = backBtn.cloneNode(true);
                backBtn.parentNode.replaceChild(newBackBtn, backBtn);
                
                newBackBtn.addEventListener('click', () => {
                    console.log('📱 Mobile back button clicked');
                    if (window.messagesHub) {
                        window.messagesHub.closeChat();
                    }
                });
                
                console.log('✅ Mobile back button initialized');
            }
        }, 300);
    }

    closeGroup() {
        if (this.messagesListener) {
            this.messagesListener();
        }

        this.currentGroup = null;
        this.currentGroupId = null;
        this.attachedFiles = [];

        const emptyState = document.getElementById('chatEmptyState');
        const chatActive = document.getElementById('chatActive');

        if (emptyState) emptyState.style.display = 'flex';
        if (chatActive) chatActive.style.display = 'none';

        const attachmentPreview = document.getElementById('attachmentPreview');
        if (attachmentPreview) {
            attachmentPreview.style.display = 'none';
            attachmentPreview.innerHTML = '';
        }
    }

    async loadMessages() {
        if (!this.currentGroupId) return;

        const messagesContainer = document.getElementById('chatMessagesContainer');
        if (!messagesContainer) return;

        messagesContainer.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading messages...</p>
            </div>
        `;

        if (this.messagesListener) {
            this.messagesListener();
        }

        this.messagesListener = this.db
            .collection('conversations')
            .doc(this.currentGroupId)
            .collection('messages')
            .orderBy('createdAt', 'asc')
            .onSnapshot((snapshot) => {
                console.log(`📊 Received ${snapshot.size} group messages`);

                if (snapshot.empty) {
                    messagesContainer.innerHTML = `
                        <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                            <i class="fas fa-comments" style="font-size: 3rem; opacity: 0.3; margin-bottom: 16px;"></i>
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    `;
                    return;
                }

                const messagesHTML = snapshot.docs.map(doc => {
                    const message = doc.data();
                    const messageId = doc.id;
                    return this.createGroupMessageBubble(message, messageId);
                }).join('');

                messagesContainer.innerHTML = messagesHTML;
                
                this.setupMessageClickListeners();
                
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, (error) => {
                console.error('❌ Error loading group messages:', error);
                messagesContainer.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #ef4444;">
                        <p>Failed to load messages</p>
                    </div>
                `;
            });
    }

    setupMessageClickListeners() {
        const messages = document.querySelectorAll('.chat-message.own');
        
        messages.forEach(message => {
            const newMessage = message.cloneNode(true);
            message.parentNode.replaceChild(newMessage, message);
            
            newMessage.addEventListener('click', (e) => {
                if (e.target.closest('.message-delete-btn') || e.target.closest('.chat-message-avatar')) {
                    return;
                }
                
                document.querySelectorAll('.chat-message.message-active').forEach(msg => {
                    if (msg !== newMessage) {
                        msg.classList.remove('message-active');
                    }
                });
                
                newMessage.classList.toggle('message-active');
            });
        });
        
        console.log('✅ Message click listeners setup');
    }

    createGroupMessageBubble(message, messageId) {
        const isOwn = message.senderId === this.currentUser.uid;
        
        const senderData = this.currentGroup.participantsData?.[message.senderId] || {
            displayName: 'Unknown',
            photoURL: null
        };

        const displayName = senderData.displayName || 'Unknown';
        const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff&size=128`;
        const avatar = senderData.photoURL || fallbackAvatar;

        const time = message.createdAt 
            ? new Date(message.createdAt.toDate()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            : 'Now';

        let attachmentHTML = '';
        if (message.attachments && message.attachments.length > 0) {
            attachmentHTML = message.attachments.map(att => {
                if (att.type === 'image') {
                    return `
                        <div class="message-attachment">
                            <img src="${att.url}" 
                                 alt="Image" 
                                 onclick="window.open('${att.url}', '_blank')" 
                                 loading="lazy"
                                 style="max-width: 280px; max-height: 280px; width: auto; height: auto; display: block; border-radius: 12px; cursor: pointer; object-fit: contain;">
                        </div>
                    `;
                } else {
                    const icon = this.getFileIcon(att.name);
                    return `
                        <div class="message-attachment-file">
                            <i class="${icon} message-attachment-icon"></i>
                            <div class="message-attachment-info">
                                <div class="message-attachment-name">${this.escapeHtml(att.name)}</div>
                                <div class="message-attachment-size">${this.formatFileSize(att.size)}</div>
                            </div>
                            <a href="${att.url}" target="_blank" download style="color: #667eea;">
                                <i class="fas fa-download"></i>
                            </a>
                        </div>
                    `;
                }
            }).join('');
        }

        const deleteBtn = isOwn ? `
            <button class="message-delete-btn" 
                    onclick="event.stopPropagation(); window.groupChat.deleteMessage('${messageId}')"
                    title="Delete message">
                <i class="fas fa-trash-alt"></i>
            </button>
        ` : '';

        const senderNameHTML = !isOwn ? `
            <div class="group-message-sender" style="font-size: 0.75rem; font-weight: 700; color: #667eea; margin-bottom: 4px;">
                ${this.escapeHtml(displayName)}
            </div>
        ` : '';

        return `
            <div class="chat-message ${isOwn ? 'own' : ''}" data-message-id="${messageId}">
                <img src="${avatar}" 
                     alt="${displayName}" 
                     class="chat-message-avatar" 
                     onclick="window.groupChat.navigateToProfile('${message.senderId}')"
                     onerror="this.src='${fallbackAvatar}'"
                     loading="lazy">
                <div class="chat-message-content">
                    ${senderNameHTML}
                    <div class="chat-message-bubble">
                        ${message.text ? this.escapeHtml(message.text) : ''}
                        ${attachmentHTML}
                    </div>
                    <div class="chat-message-time">${time}</div>
                </div>
                ${deleteBtn}
            </div>
        `;
    }

    async sendMessage() {
        const messageInput = document.getElementById('chatMessageInput');
        if (!messageInput) return;

        const text = messageInput.value.trim();
        if (!text && this.attachedFiles.length === 0) return;

        // ✅ CORRECTION : Vérification sans alert()
        if (!this.currentGroupId) {
            console.error('❌ CRITICAL: No group ID found!', {
                currentGroupId: this.currentGroupId,
                currentGroup: this.currentGroup,
                currentUser: this.currentUser?.uid
            });
            console.error('⚠ Please select a group first');
            return;
        }

        const sendBtn = document.getElementById('chatSendBtn');
        if (sendBtn) sendBtn.disabled = true;

        try {
            let attachments = [];
            if (this.attachedFiles.length > 0) {
                attachments = await this.uploadFilesToR2();
            }

            const messageData = {
                text: text,
                senderId: this.currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                attachments: attachments
            };

            await this.db
                .collection('conversations')
                .doc(this.currentGroupId)
                .collection('messages')
                .add(messageData);

            const updateData = {
                lastMessage: {
                    text: text || '📎 Attachment',
                    senderId: this.currentUser.uid
                },
                lastMessageAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            this.currentGroup.participants.forEach(userId => {
                if (userId !== this.currentUser.uid) {
                    updateData[`unreadCount.${userId}`] = firebase.firestore.FieldValue.increment(1);
                }
            });

            await this.db
                .collection('conversations')
                .doc(this.currentGroupId)
                .update(updateData);

            await this.sendGroupMessageNotifications(text);

            messageInput.value = '';
            this.attachedFiles = [];
            this.renderAttachmentPreview();

            console.log('✅ Group message sent');

        } catch (error) {
            console.error('❌ Error sending group message:', error);
        } finally {
            if (sendBtn) sendBtn.disabled = false;
        }
    }

    async sendGroupMessageNotifications(messageText) {
        try {
            console.log('📧 Sending group message notifications...');

            const recipients = [];
            
            for (const userId of this.currentGroup.participants) {
                if (userId === this.currentUser.uid) continue;
                
                const userData = this.currentGroup.participantsData[userId];
                if (userData && userData.email) {
                    recipients.push({
                        email: userData.email,
                        displayName: userData.displayName || 'User'
                    });
                }
            }

            if (recipients.length === 0) {
                console.log('ℹ No recipients to notify');
                return;
            }

            const messagePreview = messageText.length > 100 
                ? messageText.substring(0, 100) + '...' 
                : messageText;

            const response = await fetch('https://message-notification-sender.raphnardone.workers.dev/send-group-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    groupName: this.currentGroup.name,
                    groupPhoto: this.currentGroup.photoURL,
                    senderName: this.currentUser.displayName || window.currentUserData?.displayName || 'Someone',
                    messagePreview: messagePreview || '📎 Attachment',
                    recipients: recipients
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log(`✅ Notifications sent to ${result.sent} members`);
            } else {
                console.error('❌ Failed to send notifications:', result.error);
            }

        } catch (error) {
            console.error('❌ Error sending notifications:', error);
        }
    }

    async deleteMessage(messageId) {
        if (!confirm('Are you sure you want to delete this message?')) {
            return;
        }

        if (!this.currentGroupId) {
            console.error('❌ No active group');
            return;
        }

        try {
            console.log('🗑 Deleting message:', messageId);

            await this.db
                .collection('conversations')
                .doc(this.currentGroupId)
                .collection('messages')
                .doc(messageId)
                .delete();

            console.log('✅ Message deleted');

        } catch (error) {
            console.error('❌ Error deleting message:', error);
        }
    }

    async leaveGroup() {
        if (!confirm(`Are you sure you want to leave "${this.currentGroup.name}"?`)) {
            return;
        }

        try {
            console.log('🚪 Leaving group:', this.currentGroupId);

            await this.db
                .collection('conversations')
                .doc(this.currentGroupId)
                .update({
                    participants: firebase.firestore.FieldValue.arrayRemove(this.currentUser.uid),
                    [`participantsData.${this.currentUser.uid}`]: firebase.firestore.FieldValue.delete()
                });

            console.log('✅ Left group');

            this.closeGroup();

            if (window.messagesHub) {
                window.messagesHub.loadConversations();
            }

        } catch (error) {
            console.error('❌ Error leaving group:', error);
        }
    }

    async uploadFilesToR2() {
        const uploadPromises = this.attachedFiles.map(async (file) => {
            try {
                const token = await this.currentUser.getIdToken();
                const formData = new FormData();
                formData.append('file', file);
                formData.append('userId', this.currentUser.uid);
                formData.append('conversationId', this.currentGroupId);

                console.log('📤 Uploading to R2:', file.name);

                const response = await fetch(`${this.R2_WORKER_URL}/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                const data = await response.json();
                console.log('✅ File uploaded:', data.url);

                return {
                    name: file.name,
                    size: file.size,
                    type: file.type.startsWith('image/') ? 'image' : 'file',
                    url: data.url
                };

            } catch (error) {
                console.error('❌ Error uploading file:', file.name, error);
                throw error;
            }
        });

        return await Promise.all(uploadPromises);
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);

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
        }

        this.renderAttachmentPreview();
        event.target.value = '';
    }

    renderAttachmentPreview() {
        const preview = document.getElementById('attachmentPreview');
        if (!preview) return;

        if (this.attachedFiles.length === 0) {
            preview.style.display = 'none';
            preview.innerHTML = '';
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
                            <button class="attachment-remove-btn" onclick="window.groupChat.removeFile(${index})" title="Remove">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        preview.innerHTML = previewHTML;
    }

    removeFile(index) {
        this.attachedFiles.splice(index, 1);
        this.renderAttachmentPreview();
    }

    async markAsRead() {
        if (!this.currentGroupId) return;

        try {
            await this.db
                .collection('conversations')
                .doc(this.currentGroupId)
                .update({
                    [`unreadCount.${this.currentUser.uid}`]: 0
                });
        } catch (error) {
            console.error('❌ Error marking as read:', error);
        }
    }

    async renderGroupHeader() {
        const chatHeader = document.getElementById('chatHeader');
        if (!chatHeader) return;

        const groupName = this.currentGroup.name || 'Group';
        const groupAvatar = this.currentGroup.photoURL || 
                           `https://ui-avatars.com/api/?name=${encodeURIComponent(groupName)}&background=667eea&color=fff&size=128`;

        const membersCount = this.currentGroup.participants.length;
        const isAdmin = this.currentGroup.admins.includes(this.currentUser.uid);

        chatHeader.innerHTML = `
            <button class="chat-back-btn">
                <i class="fas fa-arrow-left"></i>
            </button>
            
            <div class="chat-header-user">
                <img src="${groupAvatar}" 
                     alt="${this.escapeHtml(groupName)}" 
                     class="chat-header-avatar"
                     onclick="window.groupChat.openGroupInfo()"
                     loading="eager">
                
                <div class="chat-header-info">
                    <h3>${this.escapeHtml(groupName)}</h3>
                    <div class="chat-header-status">
                        <i class="fas fa-users"></i> ${membersCount} member${membersCount > 1 ? 's' : ''}
                    </div>
                </div>
            </div>
            
            <div class="chat-header-actions">
                ${isAdmin ? `
                    <button class="chat-header-btn" onclick="window.groupMembersManager.open('${this.currentGroupId}')" title="Group settings">
                        <i class="fas fa-cog"></i>
                    </button>
                ` : ''}
                
                <button class="chat-header-btn" onclick="window.groupChat.leaveGroup()" title="Leave group">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
                
                <button class="chat-header-btn" onclick="window.messagesHub.closeChat()" title="Close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        console.log('✅ Group header rendered');
    }

    openGroupInfo() {
        console.log('ℹ Opening group info');
        if (window.groupMembersManager) {
            window.groupMembersManager.open(this.currentGroupId);
        }
    }

    navigateToProfile(userId) {
        if (!userId) return;
        console.log('🔗 Navigating to profile:', userId);
        window.location.href = `public-profile.html?id=${userId}`;
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

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    cleanup() {
        if (this.messagesListener) {
            this.messagesListener();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.groupChat = new GroupChat();
    window.groupChat.initialize();
});

window.addEventListener('beforeunload', () => {
    if (window.groupChat) {
        window.groupChat.cleanup();
    }
});

console.log('✅ group-chat.js loaded (v1.1 - No Alert)');