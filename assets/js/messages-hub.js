/* ============================================
   MESSAGES-HUB.JS - Messages Hub System v3.0
   ✅ CORRECTION MAJEURE : Séparation stricte Private/Group
   ✅ Type explicite pour chaque conversation
   ✅ Recherche et ouverture intelligente
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
        console.log('💬 Initializing Messages Hub v3.0...');
        
        firebase.auth().onAuthStateChanged(async (user) => {
            this.currentUser = user;
            if (user) {
                console.log('✅ User authenticated:', user.email);
                
                await this.waitForUserData();
                await this.updateUserLoginTime();
                await this.loadConversations();
                
                this.setupUserSearch();
                this.updateUnreadBadges();
                
                this.checkAutoOpenChat();
            }
        });
    }

    /* ==========================================
    ✅ CORRECTION MAJEURE : Créer ou récupérer UNE CONVERSATION PRIVÉE
    ========================================== */

    async getOrCreateConversation(otherUserId, otherUserData) {
        try {
            console.log('🔍 Getting or creating PRIVATE conversation with:', otherUserId);
            
            // ✅ ÉTAPE 1 : Chercher une conversation PRIVÉE existante
            // Critères stricts : type='private' ET exactement 2 participants
            const existingPrivateConv = this.conversations.find(conv => {
                const isPrivateType = conv.type === 'private';
                const hasExactlyTwoParticipants = conv.participants && conv.participants.length === 2;
                const containsBothUsers = conv.participants && 
                                         conv.participants.includes(this.currentUser.uid) && 
                                         conv.participants.includes(otherUserId);
                
                return isPrivateType && hasExactlyTwoParticipants && containsBothUsers;
            });

            if (existingPrivateConv) {
                console.log('✅ Found existing PRIVATE conversation:', existingPrivateConv.id);
                
                // ✅ Vérifier si elle a été supprimée par l'utilisateur
                const convDoc = await this.db.collection('conversations').doc(existingPrivateConv.id).get();
                const convData = convDoc.data();
                const deletedBy = convData?.deletedBy || [];
                
                if (deletedBy.includes(this.currentUser.uid)) {
                    console.log('🔄 Restoring deleted conversation...');
                    
                    await this.db.collection('conversations').doc(existingPrivateConv.id).update({
                        deletedBy: firebase.firestore.FieldValue.arrayRemove(this.currentUser.uid),
                        lastMessageAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    
                    console.log('✅ Conversation restored');
                }
                
                return existingPrivateConv.id;
            }
            
            // ✅ ÉTAPE 2 : Créer une NOUVELLE conversation PRIVÉE
            console.log('🆕 Creating new PRIVATE conversation...');
            
            // Générer un ID unique (participants triés)
            const participants = [this.currentUser.uid, otherUserId].sort();
            const conversationId = participants.join('_');
            
            console.log('📝 New conversation ID:', conversationId);
            
            // Récupérer les données des utilisateurs
            const currentUserData = await this.getUserData(this.currentUser.uid);
            
            if (!otherUserData || !otherUserData.displayName) {
                console.log('📥 Fetching other user data...');
                otherUserData = await this.getUserData(otherUserId);
            }
            
            // ✅ Créer la conversation avec TYPE EXPLICITE
            await this.db.collection('conversations').doc(conversationId).set({
                type: 'private', // ✅ TYPE EXPLICITE
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
            
            console.log('✅ New PRIVATE conversation created:', conversationId);
            
            return conversationId;
            
        } catch (error) {
            console.error('❌ Error in getOrCreateConversation:', error);
            throw error;
        }
    }

    /* ==========================================
    ✅ CORRECTION : Ouvrir une conversation (DISTINCTION PRIVATE/GROUP)
    ========================================== */

    async openConversation(userId, userData) {
        try {
            console.log('💬 Opening conversation with:', userData);

            // ✅ ÉTAPE 1 : Créer ou récupérer la conversation PRIVÉE
            const conversationId = await this.getOrCreateConversation(userId, userData);
            
            console.log('✅ Conversation ID ready:', conversationId);

            // ✅ ÉTAPE 2 : Marquer comme conversation active
            this.activeConversationId = userId;
            this.renderConversations();

            // ✅ ÉTAPE 3 : Gestion mobile
            if (window.innerWidth <= 968) {
                const container = document.querySelector('.messages-container');
                if (container) {
                    container.classList.add('mobile-chat-active');
                }
            }

            // ✅ ÉTAPE 4 : Fermer le chat de groupe si ouvert
            if (window.groupChat) {
                window.groupChat.closeGroup();
            }

            // ✅ ÉTAPE 5 : Ouvrir le CHAT PRIVÉ
            if (!window.privateChat) {
                console.error('❌ Private chat system not loaded');
                return;
            }

            await window.privateChat.openChat(userId, userData, conversationId);
            
            console.log('✅ Private chat opened successfully');

        } catch (error) {
            console.error('❌ Error opening conversation:', error);
        }
    }

    /* ==========================================
    ✅ NOUVEAU : Ouvrir un GROUPE
    ========================================== */

    async openGroup(groupId, groupData) {
        try {
            console.log('👥 Opening GROUP:', groupData.name);

            // ✅ Marquer comme conversation active
            this.activeConversationId = groupId;
            this.renderConversations();

            // ✅ Gestion mobile
            if (window.innerWidth <= 968) {
                const container = document.querySelector('.messages-container');
                if (container) {
                    container.classList.add('mobile-chat-active');
                }
            }

            // ✅ Fermer le chat privé si ouvert
            if (window.privateChat) {
                window.privateChat.closeChat();
            }

            // ✅ Ouvrir le CHAT DE GROUPE
            if (!window.groupChat) {
                console.error('❌ Group chat system not loaded');
                return;
            }

            await window.groupChat.openGroup(groupId, groupData);
            
            console.log('✅ Group chat opened successfully');

        } catch (error) {
            console.error('❌ Error opening group:', error);
        }
    }

    /* ==========================================
       ✅ Ouvrir automatiquement une conversation
       ========================================== */
    
    checkAutoOpenChat() {
        const chatDataStr = sessionStorage.getItem('openChat');
        
        if (!chatDataStr) {
            console.log('ℹ No auto-open chat request');
            return;
        }

        try {
            const chatData = JSON.parse(chatDataStr);
            
            console.log('🔔 Auto-opening chat with:', chatData.userId);

            sessionStorage.removeItem('openChat');

            const ageMinutes = (Date.now() - chatData.timestamp) / 1000 / 60;
            if (ageMinutes > 5) {
                console.warn('⚠ Chat data is too old, ignoring');
                return;
            }

            setTimeout(() => {
                console.log('🚀 Opening conversation with:', chatData.userId);
                this.openConversation(
                    chatData.userId,
                    chatData.userData || { uid: chatData.userId }
                );
            }, 1500);

        } catch (error) {
            console.error('❌ Error processing auto-open chat:', error);
            sessionStorage.removeItem('openChat');
        }
    }

    /* ==========================================
       ⏰ ATTENDRE QUE AUTH-GUARD CHARGE LES DONNÉES
       ========================================== */
    
    async waitForUserData() {
        return new Promise((resolve) => {
            if (window.currentUserData) {
                console.log('✅ User data already loaded by auth-guard.js');
                resolve();
                return;
            }
            
            console.log('⏳ Waiting for userDataLoaded event...');
            window.addEventListener('userDataLoaded', () => {
                console.log('✅ User data loaded by auth-guard.js');
                resolve();
            }, { once: true });
            
            setTimeout(() => {
                console.warn('⚠ Timeout waiting for user data - proceeding anyway');
                resolve();
            }, 5000);
        });
    }

    /* ==========================================
       👤 RÉCUPÉRATION DES DONNÉES UTILISATEUR
       ========================================== */
    
    async getUserData(userId) {
        try {
            console.log('🔍 Getting user data for:', userId);
            
            if (userId === this.currentUser?.uid && window.currentUserData) {
                console.log('✅ Using cached data from auth-guard.js');
                
                return {
                    uid: userId,
                    displayName: window.currentUserData.displayName || window.currentUserData.email?.split('@')[0] || 'You',
                    photoURL: window.currentUserData.photoURL || null,
                    email: window.currentUserData.email || null,
                    plan: window.currentUserData.plan || 'free',
                    lastLoginAt: window.currentUserData.lastLoginAt || null
                };
            }
            
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
            
            const plan = userData.plan || 
                        userData.subscriptionPlan || 
                        userData.currentPlan || 
                        'free';

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

    /* ==========================================
    ✅ CORRECTION : Chargement avec distinction PRIVATE/GROUP
    ========================================== */

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

                const conversationsMap = new Map();

                for (const doc of snapshot.docs) {
                    const convData = doc.data();
                    
                    // ✅ Filtrer les conversations supprimées
                    const deletedBy = convData.deletedBy || [];
                    if (deletedBy.includes(this.currentUser.uid)) {
                        console.log('⏭ Skipping deleted conversation:', doc.id);
                        continue;
                    }
                    
                    // ✅ Protection anti-doublons
                    if (conversationsMap.has(doc.id)) {
                        console.warn('⚠ Duplicate conversation detected, skipping:', doc.id);
                        continue;
                    }
                    
                    // ✅ DISTINCTION STRICTE : PRIVATE vs GROUP
                    const isGroup = convData.type === 'group' || convData.participants.length > 2;

                    if (isGroup) {
                        // 👥 GROUPE
                        conversationsMap.set(doc.id, {
                            id: doc.id,
                            type: 'group',
                            name: convData.name || 'Group',
                            photoURL: convData.photoURL || null,
                            description: convData.description || '',
                            participants: convData.participants || [],
                            participantsData: convData.participantsData || {},
                            admins: convData.admins || [],
                            lastMessage: convData.lastMessage,
                            lastMessageAt: convData.lastMessageAt?.toDate(),
                            unreadCount: convData.unreadCount?.[this.currentUser.uid] || 0,
                            createdAt: convData.createdAt?.toDate()
                        });
                    } else {
                        // 💬 CONVERSATION PRIVÉE
                        const otherUserId = convData.participants.find(id => id !== this.currentUser.uid);
                        const otherUserData = await this.getUserData(otherUserId);
                        const isOnline = await this.checkUserOnline(otherUserId);

                        conversationsMap.set(doc.id, {
                            id: doc.id,
                            type: 'private',
                            participants: convData.participants,
                            otherUserId: otherUserId,
                            otherUserData: otherUserData,
                            lastMessage: convData.lastMessage,
                            lastMessageAt: convData.lastMessageAt?.toDate(),
                            unreadCount: convData.unreadCount?.[this.currentUser.uid] || 0,
                            createdAt: convData.createdAt?.toDate(),
                            isOnline: isOnline
                        });
                    }
                }

                this.conversations = Array.from(conversationsMap.values());

                console.log('✅ Conversations loaded:', {
                    total: this.conversations.length,
                    private: this.conversations.filter(c => c.type === 'private').length,
                    groups: this.conversations.filter(c => c.type === 'group').length
                });
                
                this.filterConversations(this.currentFilter);
                this.updateCounters();
                this.updateUnreadBadges();
            }, (error) => {
                console.error('❌ Error loading conversations:', error);
                this.renderError('Failed to load conversations');
            });
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
            // ✅ DISTINCTION : Créer la bonne carte selon le type
            if (conv.type === 'group') {
                return this.createGroupCard(conv);
            } else {
                return this.createPrivateCard(conv);
            }
        }).join('');

        conversationsList.innerHTML = conversationsHTML;
    }

    /* ==========================================
    ✅ CARTE CONVERSATION PRIVÉE
    ========================================== */

    createPrivateCard(conv) {
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

    /* ==========================================
    ✅ CARTE GROUPE
    ========================================== */

    createGroupCard(conv) {
        const groupName = conv.name || 'Group';
        const groupAvatar = conv.photoURL || 
                           `https://ui-avatars.com/api/?name=${encodeURIComponent(groupName)}&background=667eea&color=fff`;

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

        const isActive = this.activeConversationId === conv.id;
        const membersCount = conv.participants?.length || 0;

        return `
            <div class="conversation-card ${isUnread ? 'unread' : ''} ${isActive ? 'active' : ''}" 
                 onclick="window.messagesHub.openGroup('${conv.id}', ${JSON.stringify(conv).replace(/"/g, '&quot;')})">
                
                <div class="conversation-avatar-wrapper">
                    <img src="${groupAvatar}" 
                         alt="${this.escapeHtml(groupName)}" 
                         class="conversation-avatar"
                         onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(groupName)}&background=667eea&color=fff'">
                    <div class="group-indicator">
                        <i class="fas fa-users"></i>
                    </div>
                </div>
                
                <div class="conversation-content">
                    <div class="conversation-header">
                        <h3 class="conversation-name">
                            <i class="fas fa-users" style="font-size: 0.8rem; color: #667eea; margin-right: 4px;"></i>
                            ${this.escapeHtml(groupName)}
                        </h3>
                        <span class="conversation-time">${timeAgo}</span>
                    </div>
                    <p class="conversation-last-message">${this.escapeHtml(lastMessagePreview)}</p>
                    <p class="conversation-members-count">${membersCount} member${membersCount > 1 ? 's' : ''}</p>
                </div>
                
                ${unreadBadgeHTML}
                
                <button class="delete-conversation-btn" 
                        onclick="event.stopPropagation(); window.messagesHub.deleteConversation('${conv.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
    }

    async deleteConversation(conversationId) {
        if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
            return;
        }

        try {
            console.log('🗑 Soft deleting conversation:', conversationId);
            
            const conversationRef = this.db.collection('conversations').doc(conversationId);
            
            await conversationRef.update({
                deletedBy: firebase.firestore.FieldValue.arrayUnion(this.currentUser.uid)
            });
            
            console.log('✅ Conversation hidden from your view');
            
            const conv = this.conversations.find(c => c.id === conversationId);
            if (conv && this.activeConversationId === (conv.otherUserId || conv.id)) {
                this.closeChat();
            }
        } catch (error) {
            console.error('❌ Error deleting conversation:', error);
        }
    }

    closeChat() {
        this.activeConversationId = null;
        this.renderConversations();
        
        if (window.innerWidth <= 968) {
            const container = document.querySelector('.messages-container');
            if (container) {
                container.classList.remove('mobile-chat-active');
            }
        }
        
        if (window.privateChat) {
            window.privateChat.closeChat();
        }
        
        if (window.groupChat) {
            window.groupChat.closeGroup();
        }
    }

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

    /**
     * ✅ VERSION ALTERNATIVE : Toujours afficher Date + Heure
     */
    formatTimeAgo(date) {
        if (!date) return 'Unknown';
        
        const now = new Date();
        const messageDate = new Date(date);
        
        // Calculer la différence en jours
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const messageDateStart = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
        const daysDiff = Math.floor((todayStart - messageDateStart) / (1000 * 60 * 60 * 24));
        
        // Formater l'heure
        const timeString = messageDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        
        // ✅ AUJOURD'HUI
        if (daysDiff === 0) {
            return `Today at ${timeString}`;
        }
        
        // ✅ HIER
        if (daysDiff === 1) {
            return `Yesterday at ${timeString}`;
        }
        
        // ✅ CETTE SEMAINE (2-6 jours)
        if (daysDiff >= 2 && daysDiff <= 6) {
            const dayName = messageDate.toLocaleDateString('en-US', { weekday: 'long' });
            return `${dayName} at ${timeString}`;
        }
        
        // ✅ PLUS DE 7 JOURS
        if (daysDiff >= 7 && daysDiff < 365) {
            const dateString = messageDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            return `${dateString} at ${timeString}`;
        }
        
        // ✅ PLUS D'1 AN
        const dateString = messageDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        return `${dateString} at ${timeString}`;
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

console.log('✅ messages-hub.js loaded (v3.0 - Private/Group Separation Fix)');