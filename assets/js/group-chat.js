/* ============================================
   GROUP-CHAT.JS v1.3 - PREMIUM SHARED POSTS
   💬 Gestion complète des conversations de groupe
   ✅ Rendu identique des posts partagés (comme private-chat.js)
   ✅ Envoi/réception de messages groupe
   ✅ Upload fichiers via ChatEventManager
   ✅ Gestion des membres (ajouter/retirer)
   ============================================ */

class GroupChat {
    constructor() {
        this.currentUser = null;
        this.currentGroup = null;
        this.currentGroupId = null;
        this.messagesListener = null;
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        
        this.R2_WORKER_URL = 'https://alphavault-image-storage.raphnardone.workers.dev';
    }

    async initialize() {
        console.log('👥 Initializing Group Chat v1.3 (Premium Shared Posts)...');
        
        this.auth.onAuthStateChanged((user) => {
            this.currentUser = user;
            if (user) {
                console.log('✅ Group chat user authenticated:', user.email);
            }
        });
    }

    async openGroup(groupId, groupData) {
        console.log('💬 Opening GROUP chat:', groupData.name);

        this.currentGroupId = groupId;
        this.currentGroup = groupData;

        const emptyState = document.getElementById('chatEmptyState');
        const chatActive = document.getElementById('chatActive');

        if (emptyState) emptyState.style.display = 'none';
        if (chatActive) chatActive.style.display = 'flex';

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

        const emptyState = document.getElementById('chatEmptyState');
        const chatActive = document.getElementById('chatActive');

        if (emptyState) emptyState.style.display = 'flex';
        if (chatActive) chatActive.style.display = 'none';

        if (window.chatEventManager) {
            window.chatEventManager.clearAttachments();
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

        // ✅ CORRECTION : Affichage intelligent de la date + heure
        const time = message.createdAt 
            ? this.formatMessageDate(message.createdAt.toDate())
            : 'Just now';

        // ✅ NOUVEAU : Détecter et afficher les posts partagés
        if (message.type === 'shared_post' && message.sharedPost) {
            return this.renderSharedPostBubble(message, messageId, isOwn, senderData, displayName, avatar, time);
        }

        // Messages normaux (texte + pièces jointes)
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

    /**
     * ✅ NOUVEAU : Rendu PREMIUM des posts partagés (IDENTIQUE à private-chat.js)
     */
    renderSharedPostBubble(message, messageId, isOwn, senderData, displayName, avatar, time) {
        const post = message.sharedPost;
        
        if (!post) {
            console.error('❌ Missing sharedPost data in message:', messageId);
            return this.createGroupMessageBubble(message, messageId);
        }
        
        const deleteBtn = isOwn ? `
            <button class="message-delete-btn" 
                    onclick="event.stopPropagation(); window.groupChat.deleteMessage('${messageId}')"
                    title="Delete message">
                <i class="fas fa-trash-alt"></i>
            </button>
        ` : '';

        const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff&size=128`;

        // ✅ Nom de l'expéditeur (pour les groupes uniquement)
        const senderNameHTML = !isOwn ? `
            <div class="group-message-sender" style="font-size: 0.75rem; font-weight: 700; color: #667eea; margin-bottom: 6px;">
                ${this.escapeHtml(displayName)}
            </div>
        ` : '';

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
            const displayTags = post.tags.slice(0, 3);
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
                    onclick="window.groupChat.navigateToProfile('${senderData.uid || message.senderId}')"
                    onerror="this.src='${fallbackAvatar}'"
                    loading="lazy">
                
                <div class="chat-message-content">
                    ${senderNameHTML}
                    
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

    async sendMessage() {
        const messageInput = document.getElementById('chatMessageInput');
        if (!messageInput) return;

        const text = messageInput.value.trim();
        const attachedFiles = window.chatEventManager ? window.chatEventManager.getAttachedFiles() : [];
        
        if (!text && attachedFiles.length === 0) return;

        if (!this.currentGroupId) {
            console.error('❌ CRITICAL: No group ID found!');
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
            
            if (window.chatEventManager) {
                window.chatEventManager.clearAttachments();
            }

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

    async uploadFilesToR2(files) {
        const uploadPromises = files.map(async (file) => {
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

    /* ==========================================
       ✅ HELPER FUNCTIONS (Identiques à private-chat.js)
       ========================================== */

    /**
     * ✅ Couleur dynamique par channel
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
     * ✅ Badge plan minimal
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
     * ✅ Formatage de date pour posts
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
     * ✅ Formatage de nombres
     */
    formatNumber(num) {
        if (!num) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    /**
     * ✅ Suppression du HTML (pour texte brut)
     */
    stripHtml(html) {
        if (!html) return '';
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        const text = tempDiv.textContent || tempDiv.innerText || '';
        
        return text.replace(/\s+/g, ' ').trim();
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

console.log('✅ group-chat.js loaded (v1.3 - Premium Shared Posts)');