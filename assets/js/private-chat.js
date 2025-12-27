/* ============================================
   PRIVATE-CHAT.JS - Système de Chat Privé v1.0
   💬 Conversations privées entre utilisateurs
   🔥 Firebase Firestore en temps réel
   ============================================ */

class PrivateChatSystem {
    constructor() {
        this.currentUser = null;
        this.currentConversationId = null;
        this.messagesListener = null;
        this.conversationsListener = null;
        this.otherUserId = null;
        this.otherUserData = null;
    }

    // ✅ Initialiser le système
    async initialize() {
        console.log('💬 Initializing Private Chat System...');
        
        firebase.auth().onAuthStateChanged(user => {
            this.currentUser = user;
            if (user) {
                console.log('✅ User authenticated for chat:', user.email);
            }
        });
    }

    // ✅ Générer un ID de conversation unique (toujours dans le même ordre)
    getConversationId(userId1, userId2) {
        return [userId1, userId2].sort().join('_');
    }

    // ✅ Ouvrir le chat avec un utilisateur
    async openChatWith(userId, userData) {
        if (!this.currentUser) {
            alert('Please log in to send messages');
            return;
        }

        if (this.currentUser.uid === userId) {
            alert('You cannot message yourself');
            return;
        }

        this.otherUserId = userId;
        this.otherUserData = userData;
        this.currentConversationId = this.getConversationId(this.currentUser.uid, userId);

        console.log('💬 Opening chat with:', userData.displayName || userData.email);
        console.log('📋 Conversation ID:', this.currentConversationId);

        // Créer la conversation si elle n'existe pas
        await this.createConversationIfNotExists();

        // Afficher la modal de chat
        this.showChatModal();

        // Charger les messages
        await this.loadMessages();

        // Écouter les nouveaux messages
        this.listenToMessages();
    }

    // ✅ Créer la conversation si elle n'existe pas (SANS LECTURE PRÉALABLE)
    async createConversationIfNotExists() {
        const convRef = firebase.firestore()
            .collection('conversations')
            .doc(this.currentConversationId);

        try {
            // ✅ Créer ou mettre à jour sans lecture préalable
            await convRef.set({
                participants: [this.currentUser.uid, this.otherUserId],
                participantsData: {
                    [this.currentUser.uid]: {
                        displayName: this.currentUser.displayName || this.currentUser.email,
                        photoURL: this.currentUser.photoURL || null,
                        email: this.currentUser.email
                    },
                    [this.otherUserId]: {
                        displayName: this.otherUserData.displayName || this.otherUserData.email,
                        photoURL: this.otherUserData.photoURL || this.otherUserData.avatar || null,
                        email: this.otherUserData.email
                    }
                },
                lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
                unreadCount: {
                    [this.currentUser.uid]: 0,
                    [this.otherUserId]: 0
                }
            }, { merge: true });

            // ✅ Ajouter createdAt uniquement si nouveau document
            await convRef.set({
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastMessage: null
            }, { merge: true });

            console.log('✅ Conversation ready:', this.currentConversationId);
        } catch (error) {
            console.error('❌ Error setting up conversation:', error);
            throw error;
        }
    }

    // ✅ Afficher la modal de chat
    showChatModal() {
        const modal = document.getElementById('chatModal');
        if (!modal) {
            console.error('❌ Chat modal not found');
            return;
        }

        // Mettre à jour le header
        const chatHeader = document.getElementById('chatHeader');
        const otherUserAvatar = this.otherUserData.photoURL || 
                                this.otherUserData.avatar || 
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(this.otherUserData.displayName || this.otherUserData.email)}&background=667eea&color=fff`;

        const displayName = this.otherUserData.displayName || 
                           this.otherUserData.email?.split('@')[0] || 
                           'User';

        chatHeader.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${otherUserAvatar}" 
                     alt="${displayName}" 
                     style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.3);"
                     onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff'">
                <div>
                    <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: white;">${this.escapeHtml(displayName)}</h3>
                    <p style="margin: 0; font-size: 0.85rem; opacity: 0.9;">Online</p>
                </div>
            </div>
            <button onclick="window.privateChatSystem.closeChatModal()" 
                    style="background: rgba(255,255,255,0.2); border: none; color: white; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">
                <i class="fas fa-times"></i>
            </button>
        `;

        modal.style.display = 'flex';
        document.getElementById('chatMessageInput').focus();
    }

    // ✅ Fermer la modal de chat
    closeChatModal() {
        const modal = document.getElementById('chatModal');
        if (modal) {
            modal.style.display = 'none';
        }

        // Arrêter l'écoute des messages
        if (this.messagesListener) {
            this.messagesListener();
            this.messagesListener = null;
        }

        // Réinitialiser
        this.currentConversationId = null;
        this.otherUserId = null;
        this.otherUserData = null;

        const messagesContainer = document.getElementById('chatMessagesContainer');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
    }

    // ✅ Charger les messages
    async loadMessages() {
        const messagesContainer = document.getElementById('chatMessagesContainer');
        if (!messagesContainer) return;

        messagesContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem;"></i>
                <p style="margin-top: 16px;">Loading messages...</p>
            </div>
        `;
    }

    // ✅ Écouter les messages en temps réel
    listenToMessages() {
        if (this.messagesListener) {
            this.messagesListener();
        }

        const messagesRef = firebase.firestore()
            .collection('conversations')
            .doc(this.currentConversationId)
            .collection('messages')
            .orderBy('createdAt', 'asc');

        this.messagesListener = messagesRef.onSnapshot(snapshot => {
            const messagesContainer = document.getElementById('chatMessagesContainer');
            if (!messagesContainer) return;

            if (snapshot.empty) {
                messagesContainer.innerHTML = `
                    <div style="text-align: center; padding: 60px; color: var(--text-secondary);">
                        <i class="fas fa-comments" style="font-size: 3rem; opacity: 0.5; margin-bottom: 16px;"></i>
                        <p style="font-size: 1.1rem; font-weight: 600;">No messages yet</p>
                        <p style="font-size: 0.95rem; opacity: 0.8;">Start the conversation!</p>
                    </div>
                `;
                return;
            }

            messagesContainer.innerHTML = '';

            snapshot.forEach(doc => {
                const message = doc.data();
                const messageEl = this.createMessageElement(message);
                messagesContainer.appendChild(messageEl);
            });

            // Scroll vers le bas
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            // Marquer comme lu
            this.markAsRead();
        });
    }

    // ✅ Créer un élément de message
    createMessageElement(message) {
        const isOwn = message.senderId === this.currentUser.uid;
        const messageDiv = document.createElement('div');
        
        const time = message.createdAt?.toDate ? 
                     this.formatMessageTime(message.createdAt.toDate()) : 
                     'Sending...';

        messageDiv.className = `chat-message ${isOwn ? 'own' : 'other'}`;
        messageDiv.innerHTML = `
            <div class="message-bubble ${isOwn ? 'own-bubble' : 'other-bubble'}">
                <p class="message-text">${this.escapeHtml(message.text)}</p>
                <span class="message-time">${time}</span>
            </div>
        `;

        return messageDiv;
    }

    // ✅ Envoyer un message
    async sendMessage(text) {
        if (!text || !text.trim()) return;
        if (!this.currentConversationId) return;

        try {
            const messageData = {
                senderId: this.currentUser.uid,
                text: text.trim(),
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                read: false
            };

            // Ajouter le message
            await firebase.firestore()
                .collection('conversations')
                .doc(this.currentConversationId)
                .collection('messages')
                .add(messageData);

            // Mettre à jour la conversation
            await firebase.firestore()
                .collection('conversations')
                .doc(this.currentConversationId)
                .update({
                    lastMessage: {
                        text: text.trim(),
                        senderId: this.currentUser.uid,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    },
                    lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
                    [`unreadCount.${this.otherUserId}`]: firebase.firestore.FieldValue.increment(1)
                });

            console.log('✅ Message sent');

            // Vider l'input
            const input = document.getElementById('chatMessageInput');
            if (input) {
                input.value = '';
                input.focus();
            }

        } catch (error) {
            console.error('❌ Error sending message:', error);
            alert('Failed to send message. Please try again.');
        }
    }

    // ✅ Marquer les messages comme lus
    async markAsRead() {
        if (!this.currentConversationId) return;

        try {
            await firebase.firestore()
                .collection('conversations')
                .doc(this.currentConversationId)
                .update({
                    [`unreadCount.${this.currentUser.uid}`]: 0
                });
        } catch (error) {
            console.error('❌ Error marking as read:', error);
        }
    }

    // ✅ Formater l'heure du message
    formatMessageTime(date) {
        const now = new Date();
        const messageDate = new Date(date);
        const diffMs = now - messageDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return messageDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // ✅ Échapper le HTML
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ✅ Nettoyer les listeners
    cleanup() {
        if (this.messagesListener) {
            this.messagesListener();
        }
        if (this.conversationsListener) {
            this.conversationsListener();
        }
    }
}

// ✅ Initialiser le système de chat
document.addEventListener('DOMContentLoaded', () => {
    window.privateChatSystem = new PrivateChatSystem();
    window.privateChatSystem.initialize();
});

// ✅ Fonction d'envoi de message (appelée depuis le HTML)
function sendChatMessage() {
    const input = document.getElementById('chatMessageInput');
    if (input && input.value.trim()) {
        window.privateChatSystem.sendMessage(input.value.trim());
    }
}

// ✅ Gérer l'envoi avec Enter
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('chatMessageInput');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }
});

console.log('✅ private-chat.js loaded (v1.0)');