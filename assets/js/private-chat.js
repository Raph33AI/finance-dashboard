/* ============================================
   PRIVATE-CHAT.JS - Private Chat System v2.1
   💬 Chat en temps réel avec upload de fichiers
   🔥 Récupération robuste du plan utilisateur
   ============================================ */

class PrivateChat {
    constructor() {
        this.currentUser = null;
        this.currentChatUser = null;
        this.currentConversationId = null;
        this.messagesListener = null;
        this.attachedFiles = [];
        this.MAX_FILES = 5;
        this.MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        this.db = firebase.firestore();
        this.storage = firebase.storage();
        this.auth = firebase.auth();
    }

    async initialize() {
        console.log('💬 Initializing Private Chat...');
        
        this.auth.onAuthStateChanged((user) => {
            this.currentUser = user;
            if (user) {
                console.log('✅ Chat user authenticated:', user.email);
                this.setupEventListeners();
            }
        });
    }

    /* ==========================================
       👤 RÉCUPÉRATION ROBUSTE DES DONNÉES UTILISATEUR
       ========================================== */
    
    /**
     * ✅ NOUVELLE MÉTHODE : Utilise window.currentUserData en priorité
     */
    async getUserData(userId) {
        try {
            console.log('🔍 Getting user data for:', userId);
            
            // ✅ SI C'EST L'UTILISATEUR ACTUEL : Utiliser window.currentUserData
            if (userId === this.currentUser?.uid && window.currentUserData) {
                console.log('✅ Using cached data from auth-guard.js');
                console.log('📊 Plan:', window.currentUserData.plan);
                
                return {
                    uid: userId,
                    displayName: window.currentUserData.displayName || window.currentUserData.email?.split('@')[0] || 'You',
                    photoURL: window.currentUserData.photoURL || null,
                    email: window.currentUserData.email || null,
                    plan: window.currentUserData.plan || 'free',
                    lastLoginAt: window.currentUserData.lastLoginAt || null
                };
            }
            
            // ✅ SINON : Requête Firestore pour les autres utilisateurs
            console.log('📥 Fetching from Firestore...');
            
            const userDoc = await this.db.collection('users').doc(userId).get();
            
            if (!userDoc.exists) {
                console.warn('⚠ User document not found:', userId);
                
                return {
                    uid: userId,
                    displayName: 'Unknown User',
                    photoURL: null,
                    email: null,
                    plan: 'free'
                };
            }

            const userData = userDoc.data();
            
            console.log('📄 Firestore data:', userData);
            
            // ✅ Récupération du plan (avec fallbacks)
            const plan = userData.plan || 
                        userData.subscriptionPlan || 
                        userData.currentPlan || 
                        'free';
            
            console.log('📊 Plan:', plan);

            return {
                uid: userId,
                displayName: userData.displayName || userData.email?.split('@')[0] || 'Unknown User',
                photoURL: userData.photoURL || null,
                email: userData.email || null,
                plan: plan,
                lastLoginAt: userData.lastLoginAt || null
            };

        } catch (error) {
            console.error('❌ Error getting user data:', error);
            
            return {
                uid: userId,
                displayName: 'Unknown User',
                photoURL: null,
                email: null,
                plan: 'free'
            };
        }
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

    // ✅ Ouvrir un chat
    async openChat(userId, userData) {
        console.log('💬 Opening chat with:', userData);

        // ✅ CORRECTION : Récupérer les données utilisateur avec la méthode robuste
        this.currentChatUser = await this.getUserData(userId);

        const emptyState = document.getElementById('chatEmptyState');
        const chatActive = document.getElementById('chatActive');

        if (emptyState) emptyState.style.display = 'none';
        if (chatActive) chatActive.style.display = 'flex';

        const conversationId = await this.getOrCreateConversation(userId);
        this.currentConversationId = conversationId;

        await this.loadMessages();
        await this.markAsRead();
        this.renderChatHeader();
    }

    closeChat() {
        if (this.messagesListener) {
            this.messagesListener();
        }

        this.currentChatUser = null;
        this.currentConversationId = null;
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

    // ✅ Récupérer ou créer une conversation
    async getOrCreateConversation(otherUserId) {
        const participants = [this.currentUser.uid, otherUserId].sort();
        const conversationId = participants.join('_');

        const conversationRef = this.db.collection('conversations').doc(conversationId);
        const doc = await conversationRef.get();

        if (!doc.exists) {
            // ✅ CORRECTION : Récupérer les données des deux utilisateurs avec la méthode robuste
            const currentUserData = await this.getUserData(this.currentUser.uid);
            const otherUserData = await this.getUserData(otherUserId);

            await conversationRef.set({
                participants: participants,
                participantsData: {
                    [this.currentUser.uid]: {
                        displayName: currentUserData.displayName,
                        photoURL: currentUserData.photoURL,
                        email: currentUserData.email,
                        plan: currentUserData.plan
                    },
                    [otherUserId]: {
                        displayName: otherUserData.displayName,
                        photoURL: otherUserData.photoURL,
                        email: otherUserData.email,
                        plan: otherUserData.plan
                    }
                },
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastMessage: {
                    text: '',
                    senderId: this.currentUser.uid
                },
                unreadCount: {
                    [this.currentUser.uid]: 0,
                    [otherUserId]: 0
                },
                deletedBy: []
            });

            console.log('✅ Conversation created:', conversationId);
        }

        return conversationId;
    }

    // ✅ Charger les messages
    async loadMessages() {
        if (!this.currentConversationId) return;

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
            .doc(this.currentConversationId)
            .collection('messages')
            .orderBy('createdAt', 'asc')
            .onSnapshot((snapshot) => {
                console.log(`📊 Received ${snapshot.size} messages`);

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
                    return this.createMessageBubble(message);
                }).join('');

                messagesContainer.innerHTML = messagesHTML;
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, (error) => {
                console.error('❌ Error loading messages:', error);
                messagesContainer.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #ef4444;">
                        <p>Failed to load messages</p>
                    </div>
                `;
            });
    }

    createMessageBubble(message) {
        const isOwn = message.senderId === this.currentUser.uid;
        const senderData = isOwn 
            ? { displayName: 'You', photoURL: this.currentUser.photoURL }
            : this.currentChatUser;

        const displayName = senderData.displayName || 'Unknown';
        const avatar = senderData.photoURL || 
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff`;

        const time = message.createdAt 
            ? new Date(message.createdAt.toDate()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            : 'Now';

        let attachmentHTML = '';
        if (message.attachments && message.attachments.length > 0) {
            attachmentHTML = message.attachments.map(att => {
                if (att.type === 'image') {
                    return `
                        <div class="message-attachment">
                            <img src="${att.url}" alt="Image" onclick="window.open('${att.url}', '_blank')">
                        </div>
                    `;
                } else {
                    return `
                        <div class="message-attachment-file">
                            <i class="fas fa-file message-attachment-icon"></i>
                            <div class="message-attachment-info">
                                <div class="message-attachment-name">${att.name}</div>
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

        return `
            <div class="chat-message ${isOwn ? 'own' : ''}">
                <img src="${avatar}" alt="${displayName}" class="chat-message-avatar">
                <div class="chat-message-content">
                    <div class="chat-message-bubble">
                        ${this.escapeHtml(message.text)}
                        ${attachmentHTML}
                    </div>
                    <div class="chat-message-time">${time}</div>
                </div>
            </div>
        `;
    }

    // ✅ Envoyer un message
    async sendMessage() {
        const messageInput = document.getElementById('chatMessageInput');
        if (!messageInput) return;

        const text = messageInput.value.trim();
        if (!text && this.attachedFiles.length === 0) return;

        if (!this.currentConversationId) {
            alert('No active conversation');
            return;
        }

        const sendBtn = document.getElementById('chatSendBtn');
        if (sendBtn) sendBtn.disabled = true;

        try {
            let attachments = [];
            if (this.attachedFiles.length > 0) {
                attachments = await this.uploadFiles();
            }

            const messageData = {
                text: text,
                senderId: this.currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                attachments: attachments
            };

            await this.db
                .collection('conversations')
                .doc(this.currentConversationId)
                .collection('messages')
                .add(messageData);

            await this.db
                .collection('conversations')
                .doc(this.currentConversationId)
                .update({
                    lastMessage: {
                        text: text || '📎 Attachment',
                        senderId: this.currentUser.uid
                    },
                    lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
                    [`unreadCount.${this.currentChatUser.uid}`]: firebase.firestore.FieldValue.increment(1)
                });

            messageInput.value = '';
            this.attachedFiles = [];
            this.renderAttachmentPreview();

            console.log('✅ Message sent');

        } catch (error) {
            console.error('❌ Error sending message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            if (sendBtn) sendBtn.disabled = false;
        }
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);

        for (const file of files) {
            if (this.attachedFiles.length >= this.MAX_FILES) {
                alert(`Maximum ${this.MAX_FILES} files allowed`);
                break;
            }

            if (file.size > this.MAX_FILE_SIZE) {
                alert(`${file.name} is too large (max 10MB)`);
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

                    return `
                        <div class="attachment-preview-item">
                            ${isImage 
                                ? `<img src="${previewUrl}" class="attachment-preview-img">`
                                : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(102, 126, 234, 0.1);">
                                    <i class="fas fa-file" style="font-size: 2rem; color: #667eea;"></i>
                                   </div>`
                            }
                            <button class="attachment-remove-btn" onclick="window.privateChat.removeFile(${index})">
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

    async uploadFiles() {
        const uploadPromises = this.attachedFiles.map(async (file) => {
            const fileName = `chats/${this.currentConversationId}/${Date.now()}_${file.name}`;
            const storageRef = this.storage.ref(fileName);

            await storageRef.put(file);
            const url = await storageRef.getDownloadURL();

            return {
                name: file.name,
                size: file.size,
                type: file.type.startsWith('image/') ? 'image' : 'file',
                url: url
            };
        });

        return await Promise.all(uploadPromises);
    }

    async markAsRead() {
        if (!this.currentConversationId) return;

        try {
            await this.db
                .collection('conversations')
                .doc(this.currentConversationId)
                .update({
                    [`unreadCount.${this.currentUser.uid}`]: 0
                });
        } catch (error) {
            console.error('❌ Error marking as read:', error);
        }
    }

    // async renderChatHeader() {
    //     const chatHeader = document.getElementById('chatHeader');
    //     if (!chatHeader) return;

    //     const displayName = this.currentChatUser.displayName || 'Unknown User';
    //     const avatar = this.currentChatUser.photoURL || 
    //                   `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff`;

    //     const isOnline = await this.checkUserOnline(this.currentChatUser.uid);
    //     const statusHTML = isOnline 
    //         ? '<i class="fas fa-circle" style="color: #10b981; font-size: 0.6rem;"></i> Online'
    //         : 'Offline';

    //     chatHeader.innerHTML = `
    //         <div class="chat-header-user">
    //             <img src="${avatar}" alt="${displayName}" class="chat-header-avatar">
    //             <div class="chat-header-info">
    //                 <h3>${this.escapeHtml(displayName)}</h3>
    //                 <div class="chat-header-status">${statusHTML}</div>
    //             </div>
    //         </div>
    //         <div class="chat-header-actions">
    //             <button class="chat-header-btn" onclick="window.messagesHub.closeChat()" title="Close chat">
    //                 <i class="fas fa-times"></i>
    //             </button>
    //         </div>
    //     `;
    // }

    // Dans private-chat.js, méthode renderChatHeader() ou similaire

    renderChatHeader(userData) {
        const chatHeader = document.getElementById('chatHeader');
        if (!chatHeader) return;
        
        const displayName = userData.displayName || 'Unknown User';
        const avatar = userData.photoURL || 
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff`;
        
        chatHeader.innerHTML = `
            <!-- ✅ BOUTON RETOUR MOBILE -->
            <button class="chat-back-btn">
                <i class="fas fa-arrow-left"></i>
            </button>
            
            <div class="chat-header-user">
                <img src="${avatar}" 
                    alt="${displayName}" 
                    class="chat-header-avatar"
                    onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff'">
                
                <div class="chat-header-info">
                    <h3>${displayName}</h3>
                    <div class="chat-header-status">
                        <i class="fas fa-circle" style="color: #10b981; font-size: 0.6rem;"></i>
                        Online
                    </div>
                </div>
            </div>
            
            <div class="chat-header-actions">
                <button class="chat-header-btn" title="Video call">
                    <i class="fas fa-video"></i>
                </button>
                <button class="chat-header-btn" title="Phone call">
                    <i class="fas fa-phone"></i>
                </button>
                <button class="chat-header-btn" onclick="window.messagesHub.closeChat()" title="Close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // ✅ RÉINITIALISER le bouton retour après génération du HTML
        window.messagesHub.setupMobileBackButton();
    }

    async checkUserOnline(userId) {
        try {
            const userDoc = await this.db.collection('users').doc(userId).get();
            if (!userDoc.exists) return false;

            const userData = userDoc.data();
            if (!userData.lastLoginAt) return false;

            const lastLogin = userData.lastLoginAt.toDate();
            const now = new Date();
            const diffMinutes = (now - lastLogin) / 1000 / 60;

            return diffMinutes < 5;
        } catch (error) {
            console.error('❌ Error checking online status:', error);
            return false;
        }
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
    window.privateChat = new PrivateChat();
    window.privateChat.initialize();
});

window.addEventListener('beforeunload', () => {
    if (window.privateChat) {
        window.privateChat.cleanup();
    }
});

console.log('✅ private-chat.js loaded (v2.1 - Robust plan retrieval)');