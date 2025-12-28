/* ============================================
   MESSAGES-HUB.JS - Messages Hub System v2.2
   💬 Utilise window.currentUserData (chargé par auth-guard.js)
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
        this.activeConversationId = null;
        this.db = firebase.firestore();
    }

    async initialize() {
        console.log('💬 Initializing Messages Hub...');
        
        firebase.auth().onAuthStateChanged(async (user) => {
            this.currentUser = user;
            if (user) {
                console.log('✅ User authenticated:', user.email);
                
                // Attendre que auth-guard.js charge les données
                await this.waitForUserData();
                
                // Mettre à jour lastLoginAt
                await this.updateUserLoginTime();
                
                await this.loadConversations();
                this.setupUserSearch();
                this.updateUnreadBadges();
            }
        });
    }

    /* ==========================================
       ⏰ ATTENDRE QUE AUTH-GUARD CHARGE LES DONNÉES
       ========================================== */
    
    async waitForUserData() {
        return new Promise((resolve) => {
            // Si déjà chargé
            if (window.currentUserData) {
                console.log('✅ User data already loaded by auth-guard.js');
                resolve();
                return;
            }
            
            // Sinon, attendre l'événement
            console.log('⏳ Waiting for userDataLoaded event...');
            window.addEventListener('userDataLoaded', () => {
                console.log('✅ User data loaded by auth-guard.js');
                resolve();
            }, { once: true });
            
            // Timeout de sécurité (5 secondes)
            setTimeout(() => {
                console.warn('⚠ Timeout waiting for user data - proceeding anyway');
                resolve();
            }, 5000);
        });
    }

    /* ==========================================
       👤 RÉCUPÉRATION DES DONNÉES UTILISATEUR
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

    // ✅ Mettre à jour le temps de connexion
    async updateUserLoginTime() {
        try {
            await this.db.collection('users').doc(this.currentUser.uid).set({
                lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
                email: this.currentUser.email,
                displayName: this.currentUser.displayName || this.currentUser.email?.split('@')[0] || 'User',
                photoURL: this.currentUser.photoURL || null
            }, { merge: true });
            
            console.log('✅ Login time updated');
        } catch (error) {
            console.error('❌ Error updating login time:', error);
        }
    }

    // ✅ Charger les conversations
    async loadConversations() {
        if (!this.currentUser) return;

        console.log('📥 Loading conversations...');

        const conversationsList = document.getElementById('conversationsList');
        if (!conversationsList) return;

        conversationsList.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading conversations...</p>
            </div>
        `;

        if (this.conversationsListener) {
            this.conversationsListener();
        }

        this.conversationsListener = this.db
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
                    
                    // ✅ Récupérer les données utilisateur
                    const otherUserData = await this.getUserData(otherUserId);
                    
                    // ✅ Récupérer le statut en ligne
                    const isOnline = await this.checkUserOnline(otherUserId);

                    this.conversations.push({
                        id: doc.id,
                        otherUserId: otherUserId,
                        otherUserData: otherUserData,
                        lastMessage: convData.lastMessage,
                        lastMessageAt: convData.lastMessageAt?.toDate(),
                        unreadCount: convData.unreadCount?.[this.currentUser.uid] || 0,
                        createdAt: convData.createdAt?.toDate(),
                        isOnline: isOnline
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

        this.conversationsListener = this.db
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
                    
                    // ✅ FILTRER : Ignorer les conversations supprimées par l'utilisateur
                    const deletedBy = convData.deletedBy || [];
                    if (deletedBy.includes(this.currentUser.uid)) {
                        console.log('⏭ Skipping deleted conversation:', doc.id);
                        continue;
                    }
                    
                    const otherUserId = convData.participants.find(id => id !== this.currentUser.uid);
                    const otherUserData = await this.getUserData(otherUserId);
                    const isOnline = await this.checkUserOnline(otherUserId);

                    this.conversations.push({
                        id: doc.id,
                        otherUserId: otherUserId,
                        otherUserData: otherUserData,
                        lastMessage: convData.lastMessage,
                        lastMessageAt: convData.lastMessageAt?.toDate(),
                        unreadCount: convData.unreadCount?.[this.currentUser.uid] || 0,
                        createdAt: convData.createdAt?.toDate(),
                        isOnline: isOnline
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

    // ✅ Vérifier si un utilisateur est en ligne (< 5 min)
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

    filterConversations(filter) {
        this.currentFilter = filter;

        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });

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
                <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                    <i class="fas ${icon}" style="font-size: 3rem; opacity: 0.3; margin-bottom: 16px;"></i>
                    <p style="font-weight: 600;">${message}</p>
                </div>
            `;
            return;
        }

        const conversationsHTML = this.filteredConversations.map(conv => {
            return this.createConversationCard(conv);
        }).join('');

        conversationsList.innerHTML = conversationsHTML;
    }

    createConversationCard(conv) {
        const displayName = conv.otherUserData?.displayName || 'Unknown User';
        const avatar = conv.otherUserData?.photoURL || 
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff`;

        const lastMessageText = conv.lastMessage?.text || 'No messages yet';
        const lastMessagePreview = lastMessageText.length > 60 
            ? lastMessageText.substring(0, 60) + '...' 
            : lastMessageText;

        const timeAgo = conv.lastMessageAt 
            ? this.formatTimeAgo(conv.lastMessageAt) 
            : 'Just now';

        const isUnread = conv.unreadCount > 0;
        const unreadBadgeHTML = isUnread 
            ? `<div class="unread-badge">${conv.unreadCount}</div>` 
            : '';

        const onlineIndicator = conv.isOnline 
            ? '<div class="online-indicator"></div>' 
            : '';

        const isActive = this.activeConversationId === conv.otherUserId;

        return `
            <div class="conversation-card ${isUnread ? 'unread' : ''} ${isActive ? 'active' : ''}" 
                 onclick="window.messagesHub.openConversation('${conv.otherUserId}', ${JSON.stringify(conv.otherUserData).replace(/"/g, '&quot;')})">
                
                <div class="conversation-avatar-wrapper">
                    <img src="${avatar}" 
                         alt="${this.escapeHtml(displayName)}" 
                         class="conversation-avatar"
                         onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff'">
                    ${onlineIndicator}
                </div>
                
                <div class="conversation-content">
                    <div class="conversation-header">
                        <h3 class="conversation-name">${this.escapeHtml(displayName)}</h3>
                        <span class="conversation-time">${timeAgo}</span>
                    </div>
                    <p class="conversation-last-message">${this.escapeHtml(lastMessagePreview)}</p>
                </div>
                
                ${unreadBadgeHTML}
                
                <button class="delete-conversation-btn" 
                        onclick="event.stopPropagation(); window.messagesHub.deleteConversation('${conv.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
    }

    // ✅ Supprimer (soft delete) une conversation
    async deleteConversation(conversationId) {
        if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
            return;
        }

        try {
            console.log('🗑 Soft deleting conversation:', conversationId);
            
            const conversationRef = this.db.collection('conversations').doc(conversationId);
            
            // ✅ Ajouter l'UID actuel au tableau deletedBy
            await conversationRef.update({
                deletedBy: firebase.firestore.FieldValue.arrayUnion(this.currentUser.uid)
            });
            
            console.log('✅ Conversation hidden from your view');
            
            const conv = this.conversations.find(c => c.id === conversationId);
            if (conv && this.activeConversationId === conv.otherUserId) {
                this.closeChat();
            }
        } catch (error) {
            console.error('❌ Error deleting conversation:', error);
            alert('Failed to delete conversation. Please try again.');
        }
    }

    // ✅ Ouvrir une conversation
    async openConversation(userId, userData) {
        console.log('💬 Opening conversation with:', userData);

        this.activeConversationId = userId;
        this.renderConversations();

        if (!window.privateChat) {
            console.error('❌ Private chat system not loaded');
            alert('Chat system is not available. Please refresh the page.');
            return;
        }

        await window.privateChat.openChat(userId, userData);
    }

    closeChat() {
        this.activeConversationId = null;
        this.renderConversations();
        
        if (window.privateChat) {
            window.privateChat.closeChat();
        }
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
                    <i class="fas fa-spinner fa-spin" style="font-size: 1.5rem; color: #667eea;"></i>
                </div>
            `;
            searchResults.style.display = 'block';

            this.userSearchTimeout = setTimeout(() => {
                this.searchUsers(query);
            }, 300);
        });

        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });
    }

    async searchUsers(query) {
        const searchResults = document.getElementById('userSearchResults');
        if (!searchResults) return;

        try {
            const queryLower = query.toLowerCase();

            const emailQuery = this.db
                .collection('users')
                .where('email', '>=', queryLower)
                .where('email', '<=', queryLower + '\uf8ff')
                .limit(10)
                .get();

            const nameQuery = this.db
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

            if (users.length === 0) {
                searchResults.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
                        <p style="font-weight: 600;">No users found</p>
                    </div>
                `;
                return;
            }

            const resultsHTML = users.map(user => {
                const displayName = user.displayName || user.email?.split('@')[0] || 'Unknown User';
                const avatar = user.photoURL || 
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff`;

                return `
                    <div class="user-result-card" onclick="window.messagesHub.openConversation('${user.uid}', ${JSON.stringify(user).replace(/"/g, '&quot;')}); document.getElementById('userSearchResults').style.display='none';">
                        <img src="${avatar}" 
                             alt="${this.escapeHtml(displayName)}" 
                             class="user-result-avatar">
                        
                        <div class="user-result-info">
                            <div class="user-result-name">${this.escapeHtml(displayName)}</div>
                            <div class="user-result-email">${this.escapeHtml(user.email || '')}</div>
                        </div>
                        
                        <button class="start-chat-btn">
                            <i class="fas fa-comment-dots"></i>
                        </button>
                    </div>
                `;
            }).join('');

            searchResults.innerHTML = resultsHTML;

        } catch (error) {
            console.error('❌ Error searching users:', error);
            searchResults.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #ef4444;">
                    <p>Error searching users</p>
                </div>
            `;
        }
    }

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

    renderEmptyState() {
        const conversationsList = document.getElementById('conversationsList');
        if (!conversationsList) return;

        conversationsList.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                <i class="fas fa-inbox" style="font-size: 3rem; opacity: 0.3; margin-bottom: 16px;"></i>
                <p style="font-weight: 600;">No conversations yet</p>
                <p style="font-size: 0.9rem;">Search for users above to start chatting</p>
            </div>
        `;
    }

    renderError(message) {
        const conversationsList = document.getElementById('conversationsList');
        if (!conversationsList) return;

        conversationsList.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ef4444; margin-bottom: 16px;"></i>
                <p style="font-weight: 600; color: #ef4444;">${message}</p>
            </div>
        `;
    }

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

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    cleanup() {
        if (this.conversationsListener) {
            this.conversationsListener();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.messagesHub = new MessagesHub();
    window.messagesHub.initialize();
});

window.addEventListener('beforeunload', () => {
    if (window.messagesHub) {
        window.messagesHub.cleanup();
    }
});

console.log('✅ messages-hub.js loaded (v2.2 - Uses window.currentUserData)');