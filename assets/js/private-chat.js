/* ============================================
   PRIVATE-CHAT.JS - Private Chat System v3.8
   ✅ CORRECTION : Gestion unifiée des attachments
   💬 Chat en temps réel avec upload R2
   🔥 Récupération robuste du plan utilisateur
   ============================================ */

class PrivateChat {
    constructor() {
        this.currentUser = null;
        this.currentChatUser = null;
        this.currentConversationId = null;
        this.messagesListener = null;
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        
        this.R2_WORKER_URL = 'https://alphavault-image-storage.raphnardone.workers.dev';
        this.EMAIL_NOTIFICATION_WORKER_URL = 'https://message-notification-sender.raphnardone.workers.dev';
    }

    async initialize() {
        console.log('💬 Initializing Private Chat v3.8...');
        
        this.auth.onAuthStateChanged((user) => {
            this.currentUser = user;
            if (user) {
                console.log('✅ Chat user authenticated:', user.email);
                // ✅ NE PAS appeler setupEventListeners() ici
            }
        });
    }

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
            const plan = userData.plan || userData.subscriptionPlan || userData.currentPlan || 'free';

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

    async openChat(userId, userData, conversationId) {
        console.log('💬 Opening PRIVATE chat with:', userData);
        console.log('📝 Conversation ID:', conversationId);

        if (!conversationId) {
            console.error('❌ No conversation ID provided');
            return;
        }

        this.currentChatUser = await this.getUserData(userId);
        this.currentConversationId = conversationId;
        
        console.log('✅ Chat user data loaded:', this.currentChatUser);

        const emptyState = document.getElementById('chatEmptyState');
        const chatActive = document.getElementById('chatActive');

        if (emptyState) emptyState.style.display = 'none';
        if (chatActive) chatActive.style.display = 'flex';

        // ✅ CORRECTION : Activer après un délai pour s'assurer que chatEventManager est prêt
        setTimeout(() => {
            if (window.chatEventManager) {
                window.chatEventManager.activateFor('private');
                console.log('✅ ChatEventManager activated for PRIVATE chat');
            } else {
                console.error('❌ ChatEventManager not found!');
            }
        }, 100);

        await this.renderChatHeader();
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

    closeChat() {
        if (this.messagesListener) {
            this.messagesListener();
        }

        this.currentChatUser = null;
        this.currentConversationId = null;

        const emptyState = document.getElementById('chatEmptyState');
        const chatActive = document.getElementById('chatActive');

        if (emptyState) emptyState.style.display = 'flex';
        if (chatActive) chatActive.style.display = 'none';

        // ✅ Nettoyer les attachments via le manager
        if (window.chatEventManager) {
            window.chatEventManager.clearAttachments();
        }
    }

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
                    const messageId = doc.id;
                    return this.createMessageBubble(message, messageId);
                }).join('');

                messagesContainer.innerHTML = messagesHTML;
                
                this.setupMessageClickListeners();
                
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

    createMessageBubble(message, messageId) {
        const isOwn = message.senderId === this.currentUser.uid;
        const senderData = isOwn 
            ? { 
                displayName: 'You', 
                photoURL: this.currentUser.photoURL || window.currentUserData?.photoURL,
                uid: this.currentUser.uid
            }
            : this.currentChatUser;

        const displayName = senderData.displayName || 'Unknown';
        
        const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff&size=128`;
        const avatar = senderData.photoURL || fallbackAvatar;

        // ✅ CORRECTION : Affichage intelligent de la date + heure
        const time = message.createdAt 
            ? this.formatMessageDate(message.createdAt.toDate())
            : 'Just now';

        if (message.type === 'shared_post' && message.sharedPost) {
            return this.renderSharedPostBubble(message, messageId, isOwn, senderData, displayName, avatar, time);
        }

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
                    onclick="event.stopPropagation(); window.privateChat.deleteMessage('${messageId}')"
                    title="Delete message">
                <i class="fas fa-trash-alt"></i>
            </button>
        ` : '';

        return `
            <div class="chat-message ${isOwn ? 'own' : ''}" data-message-id="${messageId}">
                <img src="${avatar}" 
                    alt="${displayName}" 
                    class="chat-message-avatar" 
                    onclick="window.privateChat.navigateToProfile('${senderData.uid}')"
                    onerror="this.src='${fallbackAvatar}'"
                    loading="lazy">
                <div class="chat-message-content">
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

    /**
     * ✅ RENDU PREMIUM : Carte de post partagé ultra-moderne
     */
    renderSharedPostBubble(message, messageId, isOwn, senderData, displayName, avatar, time) {
        const post = message.sharedPost;
        
        if (!post) {
            console.error('❌ Missing sharedPost data in message:', messageId);
            return this.createMessageBubble(message, messageId);
        }
        
        const deleteBtn = isOwn ? `
            <button class="message-delete-btn" 
                    onclick="event.stopPropagation(); window.privateChat.deleteMessage('${messageId}')"
                    title="Delete message">
                <i class="fas fa-trash-alt"></i>
            </button>
        ` : '';

        const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff&size=128`;

        // ✅ Nettoyage des données
        const cleanTitle = this.stripHtml(post.title || 'Untitled Post').trim() || 'Untitled Post';
        const cleanAuthor = this.stripHtml(post.authorName || 'Unknown Author').trim() || 'Unknown Author';
        const cleanExcerpt = this.stripHtml(post.excerpt || '').trim();
        
        // ✅ Channel badge
        const channelName = post.channelName || 'General';
        const channelIcon = post.channelIcon || '📝';
        const channelColor = this.getChannelColor(channelName);
        
        // ✅ Avatar de l'auteur du post
        const authorAvatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanAuthor)}&background=3B82F6&color=fff&size=80`;
        const authorAvatar = post.authorPhoto || authorAvatarFallback;
        
        // ✅ Badge plan de l'auteur
        const authorPlanBadge = this.getMinimalPlanBadge(post.authorPlan);
        
        // ✅ Date de publication
        let postDateHTML = '';
        if (post.createdAt) {
            const postDate = post.createdAt.toDate ? post.createdAt.toDate() : new Date(post.createdAt);
            const formattedDate = this.formatPostDate(postDate);
            postDateHTML = `
                <span class="shared-post-date">
                    <i class="fas fa-calendar-alt"></i>
                    ${formattedDate}
                </span>
            `;
        }
        
        // ✅ Image de couverture (si disponible)
        let coverImageHTML = '';
        if (post.coverImage) {
            coverImageHTML = `
                <div class="shared-post-cover">
                    <img src="${post.coverImage}" 
                        alt="Post cover" 
                        loading="lazy"
                        onerror="this.style.display='none'">
                </div>
            `;
        }
        
        // ✅ Extrait du contenu
        let excerptHTML = '';
        if (cleanExcerpt) {
            const truncatedExcerpt = cleanExcerpt.length > 120 
                ? cleanExcerpt.substring(0, 120) + '...' 
                : cleanExcerpt;
            
            excerptHTML = `
                <div class="shared-post-excerpt">
                    ${this.escapeHtml(truncatedExcerpt)}
                </div>
            `;
        }
        
        // ✅ Statistiques
        let statsHTML = '';
        if (post.views || post.likes || post.commentsCount) {
            const stats = [];
            
            if (post.views) {
                stats.push(`<span><i class="fas fa-eye"></i> ${this.formatNumber(post.views)}</span>`);
            }
            if (post.likes) {
                stats.push(`<span><i class="fas fa-heart"></i> ${this.formatNumber(post.likes)}</span>`);
            }
            if (post.commentsCount) {
                stats.push(`<span><i class="fas fa-comments"></i> ${this.formatNumber(post.commentsCount)}</span>`);
            }
            
            if (stats.length > 0) {
                statsHTML = `
                    <div class="shared-post-stats">
                        ${stats.join('')}
                    </div>
                `;
            }
        }
        
        // ✅ Tags
        let tagsHTML = '';
        if (post.tags && post.tags.length > 0) {
            const displayTags = post.tags.slice(0, 3); // Max 3 tags
            tagsHTML = `
                <div class="shared-post-tags">
                    ${displayTags.map(tag => `<span class="shared-post-tag">#${this.escapeHtml(tag)}</span>`).join('')}
                    ${post.tags.length > 3 ? `<span class="shared-post-tag-more">+${post.tags.length - 3}</span>` : ''}
                </div>
            `;
        }
        
        const postUrl = post.url || '#';

        return `
            <div class="chat-message ${isOwn ? 'own' : ''} shared-post-message" data-message-id="${messageId}">
                <img src="${avatar}" 
                    alt="${this.escapeHtml(displayName)}" 
                    class="chat-message-avatar" 
                    onclick="window.privateChat.navigateToProfile('${senderData.uid}')"
                    onerror="this.src='${fallbackAvatar}'"
                    loading="lazy">
                
                <div class="chat-message-content">
                    <div class="chat-message-bubble shared-post-bubble-premium">
                        
                        <!-- Header Premium -->
                        <div class="shared-post-header-premium">
                            <div class="shared-post-badge">
                                <i class="fas fa-share-square"></i>
                                <span>Shared Post</span>
                            </div>
                            <div class="shared-post-channel-badge" style="background: ${channelColor}15; color: ${channelColor}; border-left: 3px solid ${channelColor};">
                                <span>${channelIcon}</span>
                                <span>${this.escapeHtml(channelName)}</span>
                            </div>
                        </div>
                        
                        ${coverImageHTML}
                        
                        <!-- Contenu Principal -->
                        <div class="shared-post-body-premium" onclick="window.open('${postUrl}', '_blank')">
                            
                            <!-- Titre -->
                            <h3 class="shared-post-title-premium">${this.escapeHtml(cleanTitle)}</h3>
                            
                            ${excerptHTML}
                            
                            <!-- Auteur + Date -->
                            <div class="shared-post-author-section">
                                <img src="${authorAvatar}" 
                                    alt="${this.escapeHtml(cleanAuthor)}" 
                                    class="shared-post-author-avatar"
                                    onerror="this.src='${authorAvatarFallback}'"
                                    loading="lazy">
                                <div class="shared-post-author-info">
                                    <div class="shared-post-author-name">
                                        ${this.escapeHtml(cleanAuthor)}
                                        ${authorPlanBadge}
                                    </div>
                                    ${postDateHTML}
                                </div>
                            </div>
                            
                            ${tagsHTML}
                            ${statsHTML}
                        </div>
                        
                        <!-- Bouton View Post -->
                        <a href="${postUrl}" 
                        target="_blank" 
                        class="shared-post-view-btn-premium" 
                        onclick="event.stopPropagation()">
                            <i class="fas fa-external-link-alt"></i>
                            <span>View Full Post</span>
                        </a>
                    </div>
                    
                    <div class="chat-message-time">${time}</div>
                </div>
                
                ${deleteBtn}
            </div>
        `;
    }

    /**
     * ✅ NOUVEAU : Couleur dynamique par channel
     */
    getChannelColor(channelName) {
        const colorMap = {
            'Market Intelligence': '#3B82F6',
            'IPO Hub': '#8B5CF6',
            'M&A Insights': '#EC4899',
            'Portfolio Strategies': '#10B981',
            'Economic Analysis': '#F59E0B',
            'Trading Ideas': '#EF4444',
            'Tech & Innovation': '#06B6D4',
            'ESG & Sustainability': '#84CC16'
        };
        
        return colorMap[channelName] || '#667eea';
    }

    /**
     * ✅ NOUVEAU : Badge plan minimal
     */
    getMinimalPlanBadge(plan) {
        const badges = {
            'platinum': '<span class="mini-plan-badge platinum"><i class="fas fa-crown"></i></span>',
            'pro': '<span class="mini-plan-badge pro"><i class="fas fa-star"></i></span>',
            'basic': '<span class="mini-plan-badge basic">B</span>'
        };
        
        return badges[plan] || '';
    }

    /**
     * ✅ NOUVEAU : Formatage de date pour posts
     */
    formatPostDate(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
        });
    }

    /**
     * ✅ NOUVEAU : Formatage de nombres
     */
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    stripHtml(html) {
        if (!html) return '';
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        const text = tempDiv.textContent || tempDiv.innerText || '';
        
        return text.replace(/\s+/g, ' ').trim();
    }

    async deleteMessage(messageId) {
        if (!confirm('Are you sure you want to permanently delete this message?')) {
            return;
        }

        if (!this.currentConversationId) {
            console.error('❌ No active conversation');
            return;
        }

        try {
            console.log('🗑 Deleting message:', messageId);

            await this.db
                .collection('conversations')
                .doc(this.currentConversationId)
                .collection('messages')
                .doc(messageId)
                .delete();

            console.log('✅ Message deleted permanently');

            const messagesSnapshot = await this.db
                .collection('conversations')
                .doc(this.currentConversationId)
                .collection('messages')
                .orderBy('createdAt', 'desc')
                .limit(1)
                .get();

            if (!messagesSnapshot.empty) {
                const lastMessage = messagesSnapshot.docs[0].data();
                
                await this.db
                    .collection('conversations')
                    .doc(this.currentConversationId)
                    .update({
                        lastMessage: {
                            text: lastMessage.text || '📎 Attachment',
                            senderId: lastMessage.senderId
                        },
                        lastMessageAt: lastMessage.createdAt
                    });
            } else {
                await this.db
                    .collection('conversations')
                    .doc(this.currentConversationId)
                    .update({
                        lastMessage: {
                            text: '',
                            senderId: this.currentUser.uid
                        },
                        lastMessageAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
            }

        } catch (error) {
            console.error('❌ Error deleting message:', error);
        }
    }

    async deleteConversation(conversationId) {
        const confirmText = 
            '⚠ WARNING ⚠\n\n' +
            'Are you sure you want to permanently delete this conversation?\n\n' +
            '• All messages will be deleted\n' +
            '• This action cannot be undone\n\n' +
            'Press OK to confirm deletion.';
        
        if (!confirm(confirmText)) {
            return;
        }

        try {
            console.log('🗑 Deleting conversation:', conversationId);

            const messagesSnapshot = await this.db
                .collection('conversations')
                .doc(conversationId)
                .collection('messages')
                .get();

            console.log(`📊 Found ${messagesSnapshot.size} messages to delete`);

            const batchSize = 500;
            let batch = this.db.batch();
            let operationCount = 0;

            for (const doc of messagesSnapshot.docs) {
                batch.delete(doc.ref);
                operationCount++;

                if (operationCount === batchSize) {
                    await batch.commit();
                    batch = this.db.batch();
                    operationCount = 0;
                    console.log(`✅ Deleted batch of ${batchSize} messages`);
                }
            }

            if (operationCount > 0) {
                await batch.commit();
                console.log(`✅ Deleted final batch of ${operationCount} messages`);
            }

            await this.db
                .collection('conversations')
                .doc(conversationId)
                .delete();

            console.log('✅ Conversation deleted permanently');

            this.closeChat();

            if (window.messagesHub) {
                window.messagesHub.loadConversations();
            }

        } catch (error) {
            console.error('❌ Error deleting conversation:', error);
        }
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

    async sendEmailNotification(recipientId, messageData) {
        try {
            const recipientDoc = await this.db.collection('users').doc(recipientId).get();
            
            if (!recipientDoc.exists) {
                console.warn('⚠ Recipient not found for email notification');
                return;
            }

            const recipientData = recipientDoc.data();

            if (recipientData.emailNotifications === false) {
                console.log('🔕 User has disabled email notifications');
                return;
            }

            const notificationPayload = {
                recipientEmail: recipientData.email,
                recipientName: recipientData.displayName || recipientData.email?.split('@')[0] || 'User',
                senderName: this.currentUser.displayName || 
                           window.currentUserData?.displayName || 
                           this.currentUser.email?.split('@')[0] || 
                           'Someone',
                senderPhoto: this.currentUser.photoURL || window.currentUserData?.photoURL || null,
                messageText: messageData.text || '📎 Attachment',
                messageType: messageData.type || 'text',
                conversationId: this.currentConversationId,
                senderId: this.currentUser.uid
            };

            console.log('📧 Sending email notification:', notificationPayload);

            const response = await fetch(this.EMAIL_NOTIFICATION_WORKER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(notificationPayload)
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Email notification sent:', result.emailId);
            } else {
                console.error('❌ Failed to send email notification:', result.error);
            }

        } catch (error) {
            console.error('❌ Error sending email notification:', error);
        }
    }

    async sendMessage() {
        const messageInput = document.getElementById('chatMessageInput');
        if (!messageInput) return;

        const text = messageInput.value.trim();
        
        // ✅ CORRECTION : Récupérer les fichiers du manager global
        const attachedFiles = window.chatEventManager ? window.chatEventManager.getAttachedFiles() : [];
        
        if (!text && attachedFiles.length === 0) return;

        if (!this.currentConversationId) {
            console.error('❌ CRITICAL: No conversation ID found!');
            console.error('⚠ Please select a conversation first');
            return;
        }

        const sendBtn = document.getElementById('chatSendBtn');
        if (sendBtn) sendBtn.disabled = true;

        try {
            let attachments = [];
            if (attachedFiles.length > 0) {
                attachments = await this.uploadFilesToR2(attachedFiles);
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

            await this.sendEmailNotification(this.currentChatUser.uid, messageData);

            messageInput.value = '';
            
            // ✅ Nettoyer les attachments via le manager
            if (window.chatEventManager) {
                window.chatEventManager.clearAttachments();
            }

            console.log('✅ Message sent');

        } catch (error) {
            console.error('❌ Error sending message:', error);
        } finally {
            if (sendBtn) sendBtn.disabled = false;
        }
    }

    async sendPostAsMessage(userId, postData, userData) {
        try {
            console.log('📨 Sending post as message to:', userId);

            if (!postData || !postData.title || !postData.url) {
                console.error('❌ Invalid post data:', postData);
                throw new Error('Missing required post information');
            }

            if (!this.currentConversationId || this.currentChatUser?.uid !== userId) {
                console.log('🔄 Opening conversation via messages-hub first...');
                
                const conversationId = await window.messagesHub.getOrCreateConversation(userId, userData);
                this.currentConversationId = conversationId;
                this.currentChatUser = userData;
            }

            const cleanTitle = this.stripHtml(postData.title).trim() || 'Untitled Post';
            const previewText = `📌 Shared a post: "${cleanTitle.substring(0, 50)}${cleanTitle.length > 50 ? '...' : ''}"`;

            const messageData = {
                type: 'shared_post',
                text: previewText,
                senderId: this.currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                sharedPost: {
                    postId: postData.postId || null,
                    title: postData.title,
                    excerpt: postData.excerpt || null,
                    authorName: postData.authorName || 'Unknown Author',
                    channelId: postData.channelId || null,
                    url: postData.url,
                    publishedDate: postData.publishedDate || null
                },
                attachments: []
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
                        text: previewText,
                        senderId: this.currentUser.uid
                    },
                    lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
                    [`unreadCount.${userId}`]: firebase.firestore.FieldValue.increment(1)
                });

            await this.sendEmailNotification(userId, messageData);

            console.log('✅ Post shared successfully as message');

        } catch (error) {
            console.error('❌ Error sending post as message:', error);
            throw error;
        }
    }

    async uploadFilesToR2(files) {
        const uploadPromises = files.map(async (file) => {
            try {
                const token = await this.currentUser.getIdToken();
                const formData = new FormData();
                formData.append('file', file);
                formData.append('userId', this.currentUser.uid);
                formData.append('conversationId', this.currentConversationId);

                console.log('📤 Uploading to R2:', file.name);

                const response = await fetch(`${this.R2_WORKER_URL}/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Upload failed');
                }

                const data = await response.json();

                console.log('✅ File uploaded to R2:', data.url);

                return {
                    name: file.name,
                    size: file.size,
                    type: file.type.startsWith('image/') ? 'image' : 'file',
                    url: data.url
                };

            } catch (error) {
                console.error('❌ Error uploading file to R2:', file.name, error);
                throw error;
            }
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

    async renderChatHeader() {
        const chatHeader = document.getElementById('chatHeader');
        if (!chatHeader) return;

        if (!this.currentChatUser || !this.currentChatUser.displayName) {
            console.warn('⚠ Chat user data not ready, retrying...');
            setTimeout(() => this.renderChatHeader(), 300);
            return;
        }

        const displayName = this.currentChatUser.displayName || 'Unknown User';
        
        const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff&size=128`;
        const avatar = this.currentChatUser.photoURL || fallbackAvatar;

        const isOnline = await this.checkUserOnline(this.currentChatUser.uid);
        const statusHTML = isOnline 
            ? '<i class="fas fa-circle" style="color: #10b981; font-size: 0.6rem;"></i> Online'
            : '<i class="fas fa-circle" style="color: #94a3b8; font-size: 0.6rem;"></i> Offline';

        chatHeader.innerHTML = `
            <button class="chat-back-btn">
                <i class="fas fa-arrow-left"></i>
            </button>
            
            <div class="chat-header-user">
                <img src="${avatar}" 
                     alt="${this.escapeHtml(displayName)}" 
                     class="chat-header-avatar"
                     onclick="window.privateChat.navigateToProfile('${this.currentChatUser.uid}')"
                     onerror="this.src='${fallbackAvatar}'"
                     loading="eager">
                
                <div class="chat-header-info">
                    <h3>${this.escapeHtml(displayName)}</h3>
                    <div class="chat-header-status">${statusHTML}</div>
                </div>
            </div>
            
            <div class="chat-header-actions">
                <button class="chat-header-btn chat-delete-conversation-btn" 
                        onclick="window.privateChat.deleteConversation('${this.currentConversationId}')" 
                        title="Delete conversation">
                    <i class="fas fa-trash-alt"></i>
                </button>
                
                <button class="chat-header-btn" onclick="window.messagesHub.closeChat()" title="Close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        console.log('✅ Chat header rendered');
    }

    navigateToProfile(userId) {
        if (!userId) {
            console.warn('⚠ No user ID provided');
            return;
        }
        
        console.log('🔗 Navigating to public profile:', userId);
        
        window.location.href = `public-profile.html?id=${userId}`;
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

    /**
     * ✅ NOUVEAU : Formatage intelligent de la date + heure des messages
     */
    formatMessageDate(date) {
        const now = new Date();
        const messageDate = new Date(date);
        
        const diffMs = now - messageDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        // Heure au format HH:MM
        const timeStr = messageDate.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });

        // Aujourd'hui : afficher uniquement l'heure
        if (diffDays === 0) {
            if (diffMins < 1) return 'Just now';
            return timeStr;
        }

        // Hier
        if (diffDays === 1) {
            return `Yesterday ${timeStr}`;
        }

        // Cette semaine (derniers 7 jours)
        if (diffDays < 7) {
            const dayName = messageDate.toLocaleDateString('en-US', { weekday: 'long' });
            return `${dayName} ${timeStr}`;
        }

        // Cette année : Mois + Jour
        if (messageDate.getFullYear() === now.getFullYear()) {
            const monthDay = messageDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
            return `${monthDay}, ${timeStr}`;
        }

        // Année différente : Date complète
        const fullDate = messageDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
        return `${fullDate}, ${timeStr}`;
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

    /**
     * ✅ HELPER : Couleur dynamique par channel
     */
    getChannelColor(channelName) {
        const colorMap = {
            'Market Intelligence': '#3B82F6',
            'IPO Hub': '#8B5CF6',
            'M&A Insights': '#EC4899',
            'Portfolio Strategies': '#10B981',
            'Economic Analysis': '#F59E0B',
            'Trading Ideas': '#EF4444',
            'Tech & Innovation': '#06B6D4',
            'ESG & Sustainability': '#84CC16'
        };
        
        return colorMap[channelName] || '#667eea';
    }

    /**
     * ✅ HELPER : Badge plan minimal
     */
    getMinimalPlanBadge(plan) {
        const badges = {
            'platinum': '<span class="mini-plan-badge platinum"><i class="fas fa-crown"></i></span>',
            'pro': '<span class="mini-plan-badge pro"><i class="fas fa-star"></i></span>',
            'basic': '<span class="mini-plan-badge basic">B</span>'
        };
        
        return badges[plan] || '';
    }

    /**
     * ✅ HELPER : Formatage de date pour posts
     */
    formatPostDate(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
        });
    }

    /**
     * ✅ HELPER : Formatage de nombres
     */
    formatNumber(num) {
        if (!num) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
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

console.log('✅ private-chat.js loaded (v3.8 - Unified Events)');