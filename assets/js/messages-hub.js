/* ============================================
   MESSAGES-HUB.JS - Messages Hub System v1.0
   💬 Liste des conversations + Recherche utilisateurs
   🔥 Firebase Firestore en temps réel
   ============================================ */

class MessagesHub {
    constructor() {
        this.currentUser = null;
        this.conversations = [];
        this.filteredConversations = [];
        this.currentFilter = 'all';
        this.conversationsListener = null;
        this.userSearchTimeout = null;
    }

    // ✅ Initialiser le système
    async initialize() {
        console.log('💬 Initializing Messages Hub...');
        
        firebase.auth().onAuthStateChanged(async (user) => {
            this.currentUser = user;
            if (user) {
                console.log('✅ User authenticated:', user.email);
                await this.loadConversations();
                this.setupUserSearch();
                this.updateUnreadBadges();
            }
        });
    }

    // ✅ Charger les conversations
    async loadConversations() {
        if (!this.currentUser) return;

        console.log('📥 Loading conversations...');

        const conversationsList = document.getElementById('conversationsList');
        if (!conversationsList) return;

        // Afficher le spinner
        conversationsList.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #3B82F6;"></i>
                <p style="margin-top: 16px; color: var(--text-secondary);">Loading conversations...</p>
            </div>
        `;

        // Écouter les conversations en temps réel
        if (this.conversationsListener) {
            this.conversationsListener();
        }

        this.conversationsListener = firebase.firestore()
            .collection('conversations')
            .where('participants', 'array-contains', this.currentUser.uid)
            .orderBy('lastMessageAt', 'desc')
            .onSnapshot(async (snapshot) => {
                console.log(`📊 Received ${snapshot.size} conversations`);

                if (snapshot.empty) {
                    this.conversations = [];
                    this.renderEmptyState();
                    this.updateCounters();
                    return;
                }

                this.conversations = [];

                for (const doc of snapshot.docs) {
                    const convData = doc.data();
                    const otherUserId = convData.participants.find(id => id !== this.currentUser.uid);
                    const otherUserData = convData.participantsData[otherUserId];

                    this.conversations.push({
                        id: doc.id,
                        otherUserId: otherUserId,
                        otherUserData: otherUserData,
                        lastMessage: convData.lastMessage,
                        lastMessageAt: convData.lastMessageAt?.toDate(),
                        unreadCount: convData.unreadCount?.[this.currentUser.uid] || 0,
                        createdAt: convData.createdAt?.toDate()
                    });
                }

                console.log('✅ Conversations loaded:', this.conversations.length);
                this.filterConversations(this.currentFilter);
                this.updateCounters();
                this.updateUnreadBadges();
            }, (error) => {
                console.error('❌ Error loading conversations:', error);
                this.renderError('Failed to load conversations');
            });
    }

    // ✅ Filtrer les conversations
    filterConversations(filter) {
        this.currentFilter = filter;

        // Mettre à jour les boutons actifs
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });

        // Filtrer
        switch (filter) {
            case 'unread':
                this.filteredConversations = this.conversations.filter(conv => conv.unreadCount > 0);
                break;
            case 'all':
            default:
                this.filteredConversations = [...this.conversations];
                break;
        }

        this.renderConversations();
    }

    // ✅ Afficher les conversations
    renderConversations() {
        const conversationsList = document.getElementById('conversationsList');
        if (!conversationsList) return;

        if (this.filteredConversations.length === 0) {
            const message = this.currentFilter === 'unread' 
                ? 'No unread messages' 
                : 'No conversations yet';
            const icon = this.currentFilter === 'unread' 
                ? 'fa-envelope-open' 
                : 'fa-inbox';

            conversationsList.innerHTML = `
                <div class="conversations-empty">
                    <i class="fas ${icon}"></i>
                    <h3>${message}</h3>
                    <p>Search for users above to start a conversation</p>
                </div>
            `;
            return;
        }

        const conversationsHTML = this.filteredConversations.map(conv => {
            return this.createConversationCard(conv);
        }).join('');

        conversationsList.innerHTML = conversationsHTML;
    }

    // ✅ Créer une carte de conversation
    createConversationCard(conv) {
        const displayName = conv.otherUserData?.displayName || 
                           conv.otherUserData?.email?.split('@')[0] || 
                           'Unknown User';

        const avatar = conv.otherUserData?.photoURL || 
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff`;

        const lastMessageText = conv.lastMessage?.text || 'No messages yet';
        const lastMessagePreview = lastMessageText.length > 80 
            ? lastMessageText.substring(0, 80) + '...' 
            : lastMessageText;

        const timeAgo = conv.lastMessageAt 
            ? this.formatTimeAgo(conv.lastMessageAt) 
            : 'Just now';

        const isUnread = conv.unreadCount > 0;
        const unreadBadgeHTML = isUnread 
            ? `<div class="unread-badge">${conv.unreadCount} new</div>` 
            : '';

        return `
            <div class="conversation-card ${isUnread ? 'unread' : ''}" 
                 onclick="window.messagesHub.openConversation('${conv.otherUserId}', ${JSON.stringify(conv.otherUserData).replace(/"/g, '&quot;')})">
                
                <div class="conversation-avatar-wrapper">
                    <img src="${avatar}" 
                         alt="${this.escapeHtml(displayName)}" 
                         class="conversation-avatar"
                         onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff'">
                </div>
                
                <div class="conversation-content">
                    <div class="conversation-header">
                        <h3 class="conversation-name">${this.escapeHtml(displayName)}</h3>
                        <span class="conversation-time">${timeAgo}</span>
                    </div>
                    <p class="conversation-last-message">${this.escapeHtml(lastMessagePreview)}</p>
                </div>
                
                ${unreadBadgeHTML}
            </div>
        `;
    }

    // ✅ Ouvrir une conversation
    async openConversation(userId, userData) {
        console.log('💬 Opening conversation with:', userData);

        if (!window.privateChatSystem) {
            console.error('❌ Private chat system not loaded');
            alert('Chat system is not available. Please refresh the page.');
            return;
        }

        await window.privateChatSystem.openChatWith(userId, userData);
    }

    // ✅ Recherche utilisateurs
    setupUserSearch() {
        const searchInput = document.getElementById('userSearchInput');
        const searchResults = document.getElementById('userSearchResults');

        if (!searchInput || !searchResults) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();

            clearTimeout(this.userSearchTimeout);

            if (query.length < 2) {
                searchResults.style.display = 'none';
                searchResults.innerHTML = '';
                return;
            }

            searchResults.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #3B82F6;"></i>
                </div>
            `;
            searchResults.style.display = 'block';

            this.userSearchTimeout = setTimeout(() => {
                this.searchUsers(query);
            }, 300);
        });
    }

    // ✅ Rechercher des utilisateurs
    async searchUsers(query) {
        const searchResults = document.getElementById('userSearchResults');
        if (!searchResults) return;

        try {
            console.log('🔍 Searching users:', query);

            const queryLower = query.toLowerCase();

            // Recherche par email
            const emailQuery = firebase.firestore()
                .collection('users')
                .where('email', '>=', queryLower)
                .where('email', '<=', queryLower + '\uf8ff')
                .limit(10)
                .get();

            // Recherche par displayName
            const nameQuery = firebase.firestore()
                .collection('users')
                .where('displayName', '>=', query)
                .where('displayName', '<=', query + '\uf8ff')
                .limit(10)
                .get();

            const [emailSnapshot, nameSnapshot] = await Promise.all([emailQuery, nameQuery]);

            const usersMap = new Map();

            emailSnapshot.docs.forEach(doc => {
                if (doc.id !== this.currentUser.uid) {
                    usersMap.set(doc.id, { uid: doc.id, ...doc.data() });
                }
            });

            nameSnapshot.docs.forEach(doc => {
                if (doc.id !== this.currentUser.uid) {
                    usersMap.set(doc.id, { uid: doc.id, ...doc.data() });
                }
            });

            const users = Array.from(usersMap.values());

            console.log(`✅ Found ${users.length} users`);

            if (users.length === 0) {
                searchResults.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                        <i class="fas fa-user-slash" style="font-size: 3rem; opacity: 0.5; margin-bottom: 16px;"></i>
                        <p style="font-size: 1.1rem; font-weight: 600;">No users found</p>
                        <p style="font-size: 0.95rem;">Try a different search term</p>
                    </div>
                `;
                return;
            }

            const resultsHTML = users.map(user => {
                const displayName = user.displayName || user.email?.split('@')[0] || 'Unknown User';
                const avatar = user.photoURL || 
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff`;

                return `
                    <div class="user-result-card">
                        <img src="${avatar}" 
                             alt="${this.escapeHtml(displayName)}" 
                             class="user-result-avatar"
                             onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff'">
                        
                        <div class="user-result-info">
                            <div class="user-result-name">${this.escapeHtml(displayName)}</div>
                            <div class="user-result-email">${this.escapeHtml(user.email || '')}</div>
                        </div>
                        
                        <div class="user-result-action">
                            <button class="start-chat-btn" 
                                    onclick="window.messagesHub.openConversation('${user.uid}', ${JSON.stringify(user).replace(/"/g, '&quot;')})">
                                <i class="fas fa-comment-dots"></i>
                                Message
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            searchResults.innerHTML = resultsHTML;

        } catch (error) {
            console.error('❌ Error searching users:', error);
            searchResults.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #EF4444;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 16px;"></i>
                    <p style="font-size: 1.1rem; font-weight: 600;">Error searching users</p>
                    <p style="font-size: 0.95rem;">${error.message}</p>
                </div>
            `;
        }
    }

    // ✅ Mettre à jour les compteurs
    updateCounters() {
        const conversationsCount = document.getElementById('conversationsCount');
        const unreadFilterBadge = document.getElementById('unreadFilterBadge');

        const totalUnread = this.conversations.filter(conv => conv.unreadCount > 0).length;

        if (conversationsCount) {
            conversationsCount.textContent = `(${this.conversations.length})`;
        }

        if (unreadFilterBadge) {
            if (totalUnread > 0) {
                unreadFilterBadge.textContent = totalUnread;
                unreadFilterBadge.style.display = 'inline-block';
            } else {
                unreadFilterBadge.style.display = 'none';
            }
        }
    }

    // ✅ Mettre à jour les badges de notification
    updateUnreadBadges() {
        const totalUnread = this.conversations.filter(conv => conv.unreadCount > 0).length;
        const badge = document.getElementById('unreadMessagesBadge');

        if (badge) {
            if (totalUnread > 0) {
                badge.textContent = totalUnread;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    // ✅ Afficher l'état vide
    renderEmptyState() {
        const conversationsList = document.getElementById('conversationsList');
        if (!conversationsList) return;

        conversationsList.innerHTML = `
            <div class="conversations-empty">
                <i class="fas fa-inbox"></i>
                <h3>No conversations yet</h3>
                <p>Search for users above to start your first conversation</p>
            </div>
        `;
    }

    // ✅ Afficher une erreur
    renderError(message) {
        const conversationsList = document.getElementById('conversationsList');
        if (!conversationsList) return;

        conversationsList.innerHTML = `
            <div class="conversations-empty">
                <i class="fas fa-exclamation-triangle" style="color: #EF4444;"></i>
                <h3 style="color: #EF4444;">${message}</h3>
                <p>Please try refreshing the page</p>
            </div>
        `;
    }

    // ✅ Formater le temps
    formatTimeAgo(date) {
        if (!date) return 'Unknown';
        const seconds = Math.floor((new Date() - date) / 1000);
        const intervals = { 
            year: 31536000, 
            month: 2592000, 
            week: 604800, 
            day: 86400, 
            hour: 3600, 
            minute: 60 
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval}${unit.charAt(0)} ago`;
            }
        }

        return 'Just now';
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
        if (this.conversationsListener) {
            this.conversationsListener();
        }
    }
}

// ✅ Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    window.messagesHub = new MessagesHub();
    window.messagesHub.initialize();
});

// ✅ Nettoyer lors du changement de page
window.addEventListener('beforeunload', () => {
    if (window.messagesHub) {
        window.messagesHub.cleanup();
    }
});

console.log('✅ messages-hub.js loaded (v1.0)');