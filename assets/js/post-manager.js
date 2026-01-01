/* ============================================
   ALPHAVAULT AI - POST MANAGER
   Affichage et gestion des posts
   + PARTAGE PAR MESSAGE PRIVÉ (USERS & GROUPS)
   ============================================ */

class PostManager {
    constructor() {
        this.postId = null;
        this.post = null;
        this.currentUser = null;
        this.channels = [];
        this.postContainer = document.getElementById('postDetailCard');
        this.loadingElement = document.getElementById('postLoading');
    }

    async initialize() {
        try {
            console.log('📄 Initializing Post Manager...');

            const urlParams = new URLSearchParams(window.location.search);
            this.postId = urlParams.get('id');

            if (!this.postId) {
                throw new Error('No post ID provided');
            }

            await this.waitForAuth();
            await this.loadChannels();
            await this.loadPost();
            await window.communityService.incrementViews(this.postId);

            this.renderPost();
            await this.loadComments();

            console.log('✅ Post Manager initialized');

        } catch (error) {
            console.error('❌ Error initializing Post Manager:', error);
            this.showError('Failed to load post: ' + error.message);
        }
    }

    async waitForAuth() {
        return new Promise((resolve) => {
            const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
                this.currentUser = user;
                unsubscribe();
                resolve();
            });
        });
    }

    async loadChannels() {
        try {
            this.channels = await window.communityService.getChannels();
            console.log('📂 Channels loaded:', this.channels.length);
        } catch (error) {
            console.error('❌ Error loading channels:', error);
            this.channels = [];
        }
    }

    async loadPost() {
        try {
            this.post = await window.communityService.getPost(this.postId);
            console.log('✅ Post loaded:', this.post);
        } catch (error) {
            console.error('❌ Error loading post:', error);
            throw error;
        }
    }

    renderPost() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'none';
        }

        const isAuthor = this.currentUser && this.post.authorId === this.currentUser.uid;
        const hasLiked = this.post.likes && this.post.likes.includes(this.currentUser?.uid);

        this.postContainer.innerHTML = `
            ${this.renderPostHeader(isAuthor)}
            ${this.renderPostContent()}
            ${this.renderPostImages()}
            ${this.renderPostTags()}
            ${this.renderPostActions(hasLiked)}
        `;

        this.attachEventListeners();
        document.getElementById('commentsSection').style.display = 'block';
    }

    renderPostHeader(isAuthor) {
        const channelBadge = this.getChannelBadge(this.post.channelId);
        const planBadge = this.getPlanBadge(this.post.authorPlan);

        return `
            <div class="post-header">
                <div class="post-meta">
                    ${channelBadge}
                    <div class="post-author">
                        <img src="${this.post.authorPhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.post.authorName) + '&background=3B82F6&color=fff'}" 
                            alt="${this.post.authorName}" 
                            class="author-avatar"
                            onclick="window.location.href='public-profile.html?id=${this.post.authorId}'"
                            style="cursor: pointer;">
                        <div class="author-info">
                            <div class="author-name" onclick="window.location.href='public-profile.html?id=${this.post.authorId}'" style="cursor: pointer;">
                                ${this.post.authorName}
                                ${planBadge}
                            </div>
                            <div class="post-date">
                                <i class="fas fa-clock"></i>
                                ${this.formatDate(this.post.createdAt)}
                                ${this.post.updatedAt && this.post.updatedAt.seconds !== this.post.createdAt.seconds ? '<span class="edited-badge">(edited)</span>' : ''}
                            </div>
                        </div>
                    </div>
                </div>

                ${isAuthor ? `
                    <div class="post-author-actions">
                        <button class="icon-btn edit-btn" title="Edit post" data-action="edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="icon-btn delete-btn" title="Delete post" data-action="delete">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                ` : ''}
            </div>

            <h1 class="post-title">${this.escapeHtml(this.post.title)}</h1>

            <div class="post-stats">
                <span class="stat-item">
                    <i class="fas fa-eye"></i>
                    ${this.post.views || 0} views
                </span>
                <span class="stat-item">
                    <i class="fas fa-heart"></i>
                    ${this.post.likes?.length || 0} likes
                </span>
                <span class="stat-item">
                    <i class="fas fa-comments"></i>
                    ${this.post.commentsCount || 0} comments
                </span>
            </div>
        `;
    }

    renderPostContent() {
        const htmlContent = marked.parse(this.post.content || '');
        return `<div class="post-content">${htmlContent}</div>`;
    }

    renderPostImages() {
        if (!this.post.images || this.post.images.length === 0) return '';

        const imagesHTML = this.post.images.map((imageUrl, index) => `
            <div class="post-image-wrapper" data-image-index="${index}">
                <img src="${imageUrl}" alt="Post Image ${index + 1}" loading="lazy">
            </div>
        `).join('');

        return `<div class="post-images-grid">${imagesHTML}</div>`;
    }

    renderPostTags() {
        if (!this.post.tags || this.post.tags.length === 0) return '';

        const tagsHTML = this.post.tags.map(tag => `
            <a href="community-hub.html?tag=${encodeURIComponent(tag)}" class="post-tag">#${tag}</a>
        `).join('');

        return `<div class="post-tags">${tagsHTML}</div>`;
    }

    renderPostActions(hasLiked) {
        return `
            <div class="post-actions-bar">
                <button class="action-btn like-btn ${hasLiked ? 'liked' : ''}" data-action="like">
                    <i class="fas fa-heart"></i>
                    <span class="like-count">${this.post.likes?.length || 0}</span>
                </button>
                <button class="action-btn share-btn" data-action="share">
                    <i class="fas fa-share-alt"></i>
                    Share
                </button>
                <button class="action-btn bookmark-btn" data-action="bookmark">
                    <i class="fas fa-bookmark"></i>
                    Save
                </button>
            </div>
        `;
    }

    attachEventListeners() {
        const likeBtn = this.postContainer.querySelector('[data-action="like"]');
        if (likeBtn) likeBtn.addEventListener('click', () => this.handleLike());

        const editBtn = this.postContainer.querySelector('[data-action="edit"]');
        if (editBtn) editBtn.addEventListener('click', () => this.handleEdit());

        const deleteBtn = this.postContainer.querySelector('[data-action="delete"]');
        if (deleteBtn) deleteBtn.addEventListener('click', () => this.handleDelete());

        const shareBtn = this.postContainer.querySelector('[data-action="share"]');
        if (shareBtn) shareBtn.addEventListener('click', () => this.handleShare());

        const imageWrappers = this.postContainer.querySelectorAll('.post-image-wrapper');
        imageWrappers.forEach(wrapper => {
            wrapper.addEventListener('click', () => {
                const imageUrl = wrapper.querySelector('img').src;
                this.openImageLightbox(imageUrl);
            });
        });
    }

    async handleLike() {
        try {
            if (!this.currentUser) {
                alert('Please login to like posts');
                return;
            }

            const result = await window.communityService.toggleLike(this.postId);
            const likeBtn = this.postContainer.querySelector('[data-action="like"]');
            const likeCount = likeBtn.querySelector('.like-count');

            if (result.liked) {
                likeBtn.classList.add('liked');
            } else {
                likeBtn.classList.remove('liked');
            }

            likeCount.textContent = result.count;

            this.post.likes = result.liked 
                ? [...(this.post.likes || []), this.currentUser.uid]
                : (this.post.likes || []).filter(uid => uid !== this.currentUser.uid);

        } catch (error) {
            console.error('❌ Error liking post:', error);
            alert('Failed to like post');
        }
    }

    handleEdit() {
        window.location.href = `edit-post.html?id=${this.postId}`;
    }

    async handleDelete() {
        if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;

        try {
            await window.communityService.deletePost(this.postId);
            alert('Post deleted successfully');
            window.location.href = 'community-hub.html';
        } catch (error) {
            console.error('❌ Error deleting post:', error);
            alert('Failed to delete post: ' + error.message);
        }
    }

    handleShare() {
        const postUrl = window.location.href;
        const postTitle = this.post.title;
        const postDescription = this.stripMarkdown(this.post.content).substring(0, 200);
        this.openShareModal(postUrl, postTitle, postDescription);
    }

    openShareModal(url, title, description) {
        let modal = document.getElementById('shareModal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'shareModal';
            modal.className = 'share-modal';
            modal.innerHTML = `
                <div class="share-modal-overlay"></div>
                <div class="share-modal-content">
                    <div class="share-modal-header">
                        <h3><i class="fas fa-share-alt"></i> Share this post</h3>
                        <button class="share-modal-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="share-modal-body">
                        <div class="share-platforms">
                            <a href="#" class="share-platform-btn whatsapp" data-platform="whatsapp">
                                <div class="platform-icon"><i class="fab fa-whatsapp"></i></div>
                                <span>WhatsApp</span>
                            </a>
                            <a href="#" class="share-platform-btn instagram" data-platform="instagram">
                                <div class="platform-icon"><i class="fab fa-instagram"></i></div>
                                <span>Instagram</span>
                            </a>
                            <a href="#" class="share-platform-btn twitter" data-platform="twitter">
                                <div class="platform-icon"><i class="fab fa-x-twitter"></i></div>
                                <span>X</span>
                            </a>
                            <a href="#" class="share-platform-btn linkedin" data-platform="linkedin">
                                <div class="platform-icon"><i class="fab fa-linkedin-in"></i></div>
                                <span>LinkedIn</span>
                            </a>
                            <a href="#" class="share-platform-btn facebook" data-platform="facebook">
                                <div class="platform-icon"><i class="fab fa-facebook-f"></i></div>
                                <span>Facebook</span>
                            </a>
                            <a href="#" class="share-platform-btn telegram" data-platform="telegram">
                                <div class="platform-icon"><i class="fab fa-telegram-plane"></i></div>
                                <span>Telegram</span>
                            </a>
                            <a href="#" class="share-platform-btn email" data-platform="email">
                                <div class="platform-icon"><i class="fas fa-envelope"></i></div>
                                <span>Email</span>
                            </a>
                            <button class="share-platform-btn private-message" onclick="event.preventDefault(); window.postManager.openShareAsMessageModal();">
                                <div class="platform-icon"><i class="fas fa-paper-plane"></i></div>
                                <span>Private Message</span>
                            </button>
                        </div>

                        <div class="share-link-section">
                            <div class="share-link-wrapper">
                                <input type="text" class="share-link-input" readonly value="">
                                <button class="share-copy-btn">
                                    <i class="fas fa-copy"></i> Copy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            const overlay = modal.querySelector('.share-modal-overlay');
            const closeBtn = modal.querySelector('.share-modal-close');
            const copyBtn = modal.querySelector('.share-copy-btn');
            
            overlay.addEventListener('click', () => this.closeShareModal());
            closeBtn.addEventListener('click', () => this.closeShareModal());
            copyBtn.addEventListener('click', () => this.copyShareLink());

            this.escapeHandler = (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    this.closeShareModal();
                }
            };
            document.addEventListener('keydown', this.escapeHandler);
        }

        const linkInput = modal.querySelector('.share-link-input');
        linkInput.value = url;

        const encodedUrl = encodeURIComponent(url);
        const encodedTitle = encodeURIComponent(title);
        const encodedDescription = encodeURIComponent(description);

        // Platform links
        modal.querySelector('[data-platform="whatsapp"]').href = `https://wa.me/?text=${encodedTitle}%0A%0A${encodedDescription}%0A%0A${encodedUrl}`;
        modal.querySelector('[data-platform="twitter"]').href = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        modal.querySelector('[data-platform="linkedin"]').href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        modal.querySelector('[data-platform="facebook"]').href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        modal.querySelector('[data-platform="telegram"]').href = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        modal.querySelector('[data-platform="email"]').href = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0ARead more: ${encodedUrl}`;

        // Instagram special handling
        const instagramBtn = modal.querySelector('[data-platform="instagram"]');
        const newInstagramBtn = instagramBtn.cloneNode(true);
        instagramBtn.parentNode.replaceChild(newInstagramBtn, instagramBtn);
        
        newInstagramBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(() => {
                    const originalHTML = newInstagramBtn.innerHTML;
                    newInstagramBtn.innerHTML = '<div class="platform-icon"><i class="fas fa-check"></i></div><span>Link copied!</span>';
                    setTimeout(() => { newInstagramBtn.innerHTML = originalHTML; }, 2000);
                    setTimeout(() => { window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer'); }, 500);
                }).catch(() => {
                    alert('Link copied! Paste it in your Instagram Story or Bio.');
                    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
                });
            } else {
                alert('Link copied! Paste it in your Instagram Story or Bio.');
                window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
            }
        });

        const scrollY = window.scrollY;
        document.body.classList.add('modal-open');
        document.body.style.top = `-${scrollY}px`;
        
        requestAnimationFrame(() => { modal.classList.add('active'); });
        
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
    }

    closeShareModal() {
        const modal = document.getElementById('shareModal');
        if (modal && modal.classList.contains('active')) {
            modal.classList.remove('active');
            
            const scrollY = document.body.style.top;
            document.body.classList.remove('modal-open');
            document.body.style.top = '';
            
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
            
            modal.removeAttribute('role');
            modal.removeAttribute('aria-modal');
            
            if (this.escapeHandler) {
                document.removeEventListener('keydown', this.escapeHandler);
                this.escapeHandler = null;
            }
        }
    }

    copyShareLink() {
        const linkInput = document.querySelector('.share-link-input');
        const copyBtn = document.querySelector('.share-copy-btn');
        if (!linkInput || !copyBtn) return;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(linkInput.value)
                .then(() => {
                    const originalHTML = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    copyBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    setTimeout(() => {
                        copyBtn.innerHTML = originalHTML;
                        copyBtn.style.background = '';
                    }, 2000);
                })
                .catch(() => this.copyShareLinkFallback(linkInput, copyBtn));
        } else {
            this.copyShareLinkFallback(linkInput, copyBtn);
        }
    }

    copyShareLinkFallback(linkInput, copyBtn) {
        try {
            linkInput.select();
            linkInput.setSelectionRange(0, 99999);
            const successful = document.execCommand('copy');
            
            if (successful) {
                const originalHTML = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                copyBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                setTimeout(() => {
                    copyBtn.innerHTML = originalHTML;
                    copyBtn.style.background = '';
                }, 2000);
            } else {
                throw new Error('Copy command failed');
            }
        } catch (err) {
            console.error('Fallback copy failed:', err);
            alert('Please copy the link manually: ' + linkInput.value);
        }
        window.getSelection().removeAllRanges();
    }

    /* ==========================================
       💬 PARTAGE PAR MESSAGE PRIVÉ
       ========================================== */

    openShareAsMessageModal() {
        console.log('💬 Opening share modal - USERS by default...');
        this.closeShareModal();

        let modal = document.getElementById('shareMessageModal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'shareMessageModal';
            modal.className = 'share-modal share-message-modal';
            modal.innerHTML = `
                <div class="share-modal-overlay"></div>
                <div class="share-modal-content">
                    <div class="share-modal-header">
                        <h3><i class="fas fa-paper-plane"></i> Send to...</h3>
                        <button class="share-modal-close"><i class="fas fa-times"></i></button>
                    </div>
                    
                    <div class="share-modal-body">
                        <div class="share-tabs">
                            <button class="share-tab active" data-tab="users">
                                <i class="fas fa-user"></i><span>Users</span>
                            </button>
                            <button class="share-tab" data-tab="groups">
                                <i class="fas fa-users"></i><span>Groups</span>
                            </button>
                        </div>

                        <div class="user-search-wrapper">
                            <i class="fas fa-search search-icon"></i>
                            <input type="text" class="user-search-input" placeholder="Search users..." id="shareSearchInput">
                        </div>

                        <div class="share-content-tab active" data-content="users" id="usersTabContent">
                            <div class="users-list-wrapper" id="shareUsersList">
                                <div class="loading-spinner">
                                    <i class="fas fa-spinner fa-spin"></i>
                                    <p>Loading users...</p>
                                </div>
                            </div>
                        </div>

                        <div class="share-content-tab" data-content="groups" id="groupsTabContent">
                            <div class="groups-list-wrapper" id="shareGroupsList"></div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            const overlay = modal.querySelector('.share-modal-overlay');
            const closeBtn = modal.querySelector('.share-modal-close');
            const searchInput = modal.querySelector('#shareSearchInput');
            const tabs = modal.querySelectorAll('.share-tab');
            
            overlay.addEventListener('click', () => this.closeShareMessageModal());
            closeBtn.addEventListener('click', () => this.closeShareMessageModal());

            // ✅ GESTION DES ONGLETS (MASQUAGE FORCÉ)
            tabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    e.preventDefault();
                    const tabName = tab.dataset.tab;
                    console.log('📑 Switching to tab:', tabName);
                    
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    
                    const usersTabContent = modal.querySelector('#usersTabContent');
                    const groupsTabContent = modal.querySelector('#groupsTabContent');
                    
                    if (tabName === 'users') {
                        usersTabContent.style.display = 'block';
                        usersTabContent.classList.add('active');
                        groupsTabContent.style.display = 'none';
                        groupsTabContent.classList.remove('active');
                        searchInput.placeholder = 'Search users...';
                        searchInput.value = '';
                        this.loadUsersForShare();
                    } else if (tabName === 'groups') {
                        usersTabContent.style.display = 'none';
                        usersTabContent.classList.remove('active');
                        groupsTabContent.style.display = 'block';
                        groupsTabContent.classList.add('active');
                        searchInput.placeholder = 'Search groups...';
                        searchInput.value = '';
                        this.loadGroupsForShare();
                    }
                    
                    console.log('✅ Display:', { users: usersTabContent.style.display, groups: groupsTabContent.style.display });
                });
            });

            // Search debounce
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    const activeTab = modal.querySelector('.share-tab.active').dataset.tab;
                    const query = e.target.value.trim();
                    if (activeTab === 'users') {
                        this.searchUsersForShare(query);
                    } else {
                        this.searchGroupsForShare(query);
                    }
                }, 300);
            });

            this.escapeMessageHandler = (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    this.closeShareMessageModal();
                }
            };
            document.addEventListener('keydown', this.escapeMessageHandler);
        }

        // ✅ RÉINITIALISER (USERS PAR DÉFAUT)
        const usersTab = modal.querySelector('#usersTabContent');
        const groupsTab = modal.querySelector('#groupsTabContent');
        
        if (usersTab) {
            usersTab.style.display = 'block';
            usersTab.classList.add('active');
        }
        if (groupsTab) {
            groupsTab.style.display = 'none';
            groupsTab.classList.remove('active');
        }

        const tabs = modal.querySelectorAll('.share-tab');
        tabs.forEach(t => t.classList.remove('active'));
        modal.querySelector('[data-tab="users"]')?.classList.add('active');

        const searchInput = modal.querySelector('#shareSearchInput');
        if (searchInput) {
            searchInput.value = '';
            searchInput.placeholder = 'Search users...';
        }

        this.loadUsersForShare();

        const scrollY = window.scrollY;
        document.body.classList.add('modal-open');
        document.body.style.top = `-${scrollY}px`;
        
        requestAnimationFrame(() => { modal.classList.add('active'); });
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
    }

    closeShareMessageModal() {
        const modal = document.getElementById('shareMessageModal');
        if (modal && modal.classList.contains('active')) {
            modal.classList.remove('active');
            
            const scrollY = document.body.style.top;
            document.body.classList.remove('modal-open');
            document.body.style.top = '';
            
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
            
            modal.removeAttribute('role');
            modal.removeAttribute('aria-modal');
            
            if (this.escapeMessageHandler) {
                document.removeEventListener('keydown', this.escapeMessageHandler);
                this.escapeMessageHandler = null;
            }
        }
    }

    async loadUsersForShare() {
        const usersList = document.getElementById('shareUsersList');
        if (!usersList) return;

        usersList.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Loading users...</p></div>';

        try {
            const users = await window.communityService.getAllUsers(50);
            this.renderUsersList(users);
        } catch (error) {
            console.error('❌ Error loading users:', error);
            usersList.innerHTML = '<div style="text-align: center; padding: 40px; color: #ef4444;"><i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 16px;"></i><p style="font-weight: 600;">Failed to load users</p></div>';
        }
    }

    async searchUsersForShare(query) {
        const usersList = document.getElementById('shareUsersList');
        if (!usersList) return;

        if (!query || query.length < 2) {
            await this.loadUsersForShare();
            return;
        }

        usersList.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Searching...</p></div>';

        try {
            const users = await window.communityService.searchUsersForShare(query, 20);
            this.renderUsersList(users, query);
        } catch (error) {
            console.error('❌ Error searching users:', error);
            usersList.innerHTML = '<div style="text-align: center; padding: 40px; color: #ef4444;"><p>Search failed. Please try again.</p></div>';
        }
    }

    renderUsersList(users, query = '') {
        const usersList = document.getElementById('shareUsersList');
        if (!usersList) return;

        if (users.length === 0) {
            const message = query ? `No users found for "${this.escapeHtml(query)}"` : 'No users available';
            usersList.innerHTML = `<div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);"><i class="fas fa-user-slash" style="font-size: 3rem; opacity: 0.3; margin-bottom: 16px;"></i><p style="font-weight: 600; font-size: 1.1rem;">${message}</p></div>`;
            return;
        }

        const usersHTML = users.map(user => {
            const displayName = user.displayName || user.email?.split('@')[0] || 'Unknown User';
            const avatar = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3B82F6&color=fff&size=128`;
            const plan = user.plan || 'free';
            const planBadge = this.getPlanBadge(plan);

            return `
                <div class="user-select-item user-type-individual" 
                    onclick="window.postManager.sendPostAsMessage('${user.uid}', ${JSON.stringify({ displayName, photoURL: user.photoURL || '', email: user.email || '' }).replace(/"/g, '&quot;')})">
                    <div class="user-select-avatar-wrapper individual-avatar">
                        <img src="${avatar}" alt="${this.escapeHtml(displayName)}" class="user-select-avatar" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3B82F6&color=fff&size=128'">
                        <div class="user-type-indicator"><i class="fas fa-user"></i></div>
                    </div>
                    <div class="user-select-info">
                        <div class="user-select-name">
                            <i class="fas fa-circle-user" style="font-size: 0.75rem; color: #3B82F6; margin-right: 6px; opacity: 0.7;"></i>
                            ${this.escapeHtml(displayName)} ${planBadge}
                        </div>
                        <div class="user-select-email">
                            <i class="fas fa-envelope" style="font-size: 0.7rem; margin-right: 4px; opacity: 0.5;"></i>
                            ${this.escapeHtml(user.email || 'No email')}
                        </div>
                    </div>
                    <button class="user-select-send-btn individual-btn"><i class="fas fa-paper-plane"></i><span>Send</span></button>
                </div>
            `;
        }).join('');

        usersList.innerHTML = `<div class="users-select-list">${usersHTML}</div>`;
    }

    async loadGroupsForShare() {
        const groupsList = document.getElementById('shareGroupsList');
        if (!groupsList) return;

        groupsList.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Loading groups...</p></div>';

        try {
            const db = firebase.firestore();
            const groupsSnapshot = await db
                .collection('conversations')
                .where('type', '==', 'group')
                .where('participants', 'array-contains', this.currentUser.uid)
                .orderBy('lastMessageAt', 'desc')
                .limit(50)
                .get();

            const groups = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log('✅ Groups loaded:', groups.length);
            this.renderGroupsList(groups);

        } catch (error) {
            console.error('❌ Error loading groups:', error);
            groupsList.innerHTML = '<div style="text-align: center; padding: 40px; color: #ef4444;"><i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 16px;"></i><p style="font-weight: 600;">Failed to load groups</p></div>';
        }
    }

    async searchGroupsForShare(query) {
        const groupsList = document.getElementById('shareGroupsList');
        if (!groupsList) return;

        if (!query || query.length < 2) {
            await this.loadGroupsForShare();
            return;
        }

        groupsList.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Searching...</p></div>';

        try {
            const db = firebase.firestore();
            const queryLower = query.toLowerCase();
            
            const groupsSnapshot = await db
                .collection('conversations')
                .where('type', '==', 'group')
                .where('participants', 'array-contains', this.currentUser.uid)
                .get();

            const groups = groupsSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(group => (group.name || '').toLowerCase().includes(queryLower))
                .slice(0, 20);

            this.renderGroupsList(groups, query);

        } catch (error) {
            console.error('❌ Error searching groups:', error);
            groupsList.innerHTML = '<div style="text-align: center; padding: 40px; color: #ef4444;"><p>Search failed. Please try again.</p></div>';
        }
    }

    renderGroupsList(groups, query = '') {
        const groupsList = document.getElementById('shareGroupsList');
        if (!groupsList) return;

        if (groups.length === 0) {
            const message = query ? `No groups found for "${this.escapeHtml(query)}"` : 'No groups available';
            groupsList.innerHTML = `<div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);"><i class="fas fa-users-slash" style="font-size: 3rem; opacity: 0.3; margin-bottom: 16px;"></i><p style="font-weight: 600; font-size: 1.1rem;">${message}</p><p style="font-size: 0.9rem; margin-top: 8px;">Create a group from the Messages page</p></div>`;
            return;
        }

        const groupsHTML = groups.map(group => {
            const groupName = group.name || 'Group';
            const avatar = group.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(groupName)}&background=667eea&color=fff&size=128&bold=true`;
            const membersCount = group.participants?.length || 0;

            return `
                <div class="user-select-item group-select-item user-type-group" 
                    onclick="window.postManager.sendPostAsGroupMessage('${group.id}', ${JSON.stringify(group).replace(/"/g, '&quot;')})">
                    <div class="user-select-avatar-wrapper group-avatar">
                        <img src="${avatar}" alt="${this.escapeHtml(groupName)}" class="user-select-avatar" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(groupName)}&background=667eea&color=fff&size=128&bold=true'">
                        <div class="group-type-indicator"><i class="fas fa-users"></i></div>
                    </div>
                    <div class="user-select-info">
                        <div class="user-select-name">
                            <div class="group-name-badge">
                                <i class="fas fa-users"></i>
                                <span>${this.escapeHtml(groupName)}</span>
                            </div>
                        </div>
                        <div class="user-select-email group-members-count">
                            <i class="fas fa-user-friends" style="font-size: 0.7rem; margin-right: 4px; color: #667eea;"></i>
                            <strong>${membersCount}</strong> member${membersCount !== 1 ? 's' : ''}
                        </div>
                    </div>
                    <button class="user-select-send-btn group-btn"><i class="fas fa-paper-plane"></i><span>Send to Group</span></button>
                </div>
            `;
        }).join('');

        groupsList.innerHTML = groupsHTML;
    }

    async sendPostAsMessage(userId, userData) {
        try {
            console.log('📤 Sending post to user:', userId);
            this.closeShareMessageModal();

            if (!this.currentUser) {
                alert('You must be logged in to send messages.');
                return;
            }

            const channel = this.channels.find(c => c.id === this.post.channelId);
            const cleanContent = this.stripMarkdown(this.post.content || '');
            const excerpt = cleanContent.substring(0, 200).trim();

            const postData = {
                postId: this.postId,
                title: this.post.title || 'Untitled Post',
                content: this.post.content || '',
                excerpt: excerpt || 'No preview available',
                authorId: this.post.authorId,
                authorName: this.post.authorName || 'Unknown Author',
                authorPhoto: this.post.authorPhoto || null,
                authorPlan: this.post.authorPlan || 'free',
                channelId: this.post.channelId,
                channelName: channel ? channel.name : 'General',
                channelIcon: channel ? channel.icon : '📝',
                tags: this.post.tags || [],
                views: this.post.views || 0,
                likes: this.post.likes?.length || 0,
                commentsCount: this.post.commentsCount || 0,
                coverImage: (this.post.images && this.post.images.length > 0) ? this.post.images[0] : null,
                createdAt: this.post.createdAt || firebase.firestore.Timestamp.now(),
                url: window.location.href
            };

            const participants = [this.currentUser.uid, userId].sort();
            const conversationId = participants.join('_');
            const db = firebase.firestore();
            const conversationRef = db.collection('conversations').doc(conversationId);
            const conversationDoc = await conversationRef.get();

            if (!conversationDoc.exists) {
                const currentUserData = {
                    displayName: this.currentUser.displayName || this.currentUser.email?.split('@')[0] || 'User',
                    photoURL: this.currentUser.photoURL || null,
                    email: this.currentUser.email || null,
                    plan: window.currentUserData?.plan || 'free'
                };

                await conversationRef.set({
                    type: 'private',
                    participants: participants,
                    participantsData: {
                        [this.currentUser.uid]: currentUserData,
                        [userId]: {
                            displayName: userData.displayName || 'User',
                            photoURL: userData.photoURL || null,
                            email: userData.email || null,
                            plan: userData.plan || 'free'
                        }
                    },
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastMessage: { text: `📌 Shared: "${postData.title}"`, senderId: this.currentUser.uid },
                    unreadCount: { [this.currentUser.uid]: 0, [userId]: 1 },
                    deletedBy: []
                });
            }

            const messageData = {
                type: 'shared_post',
                text: `📌 Shared a post: "${postData.title}"`,
                senderId: this.currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                sharedPost: postData,
                attachments: []
            };

            await conversationRef.collection('messages').add(messageData);
            await conversationRef.update({
                lastMessage: { text: `📌 Shared: "${postData.title}"`, senderId: this.currentUser.uid },
                lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
                [`unreadCount.${userId}`]: firebase.firestore.FieldValue.increment(1)
            });

            this.showSuccessNotification(`Post shared with ${userData.displayName || 'user'}!`);

            setTimeout(() => {
                if (confirm('Post sent successfully! Go to messages?')) {
                    sessionStorage.setItem('openChat', JSON.stringify({ userId, userData, timestamp: Date.now() }));
                    window.location.href = 'messages.html';
                }
            }, 1500);

        } catch (error) {
            console.error('❌ Error sending post:', error);
            alert('Failed to send post: ' + (error.message || 'Unknown error'));
        }
    }

    async sendPostAsGroupMessage(groupId, groupData) {
        try {
            console.log('📤 Sending post to group:', groupId);
            this.closeShareMessageModal();

            if (!this.currentUser) {
                alert('You must be logged in to send messages.');
                return;
            }

            const channel = this.channels.find(c => c.id === this.post.channelId);
            const cleanContent = this.stripMarkdown(this.post.content || '');
            const excerpt = cleanContent.substring(0, 200).trim();

            const postData = {
                postId: this.postId,
                title: this.post.title || 'Untitled Post',
                content: this.post.content || '',
                excerpt: excerpt || 'No preview available',
                authorId: this.post.authorId,
                authorName: this.post.authorName || 'Unknown Author',
                authorPhoto: this.post.authorPhoto || null,
                authorPlan: this.post.authorPlan || 'free',
                channelId: this.post.channelId,
                channelName: channel ? channel.name : 'General',
                channelIcon: channel ? channel.icon : '📝',
                tags: this.post.tags || [],
                views: this.post.views || 0,
                likes: this.post.likes?.length || 0,
                commentsCount: this.post.commentsCount || 0,
                coverImage: (this.post.images && this.post.images.length > 0) ? this.post.images[0] : null,
                createdAt: this.post.createdAt || firebase.firestore.Timestamp.now(),
                url: window.location.href
            };

            const db = firebase.firestore();
            const groupRef = db.collection('conversations').doc(groupId);

            const messageData = {
                type: 'shared_post',
                text: `📌 Shared a post: "${postData.title}"`,
                senderId: this.currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                sharedPost: postData,
                attachments: []
            };

            await groupRef.collection('messages').add(messageData);

            const updateData = {
                lastMessage: { text: `📌 Shared: "${postData.title}"`, senderId: this.currentUser.uid },
                lastMessageAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            groupData.participants.forEach(userId => {
                if (userId !== this.currentUser.uid) {
                    updateData[`unreadCount.${userId}`] = firebase.firestore.FieldValue.increment(1);
                }
            });

            await groupRef.update(updateData);

            this.showSuccessNotification(`Post shared to ${groupData.name || 'group'}!`);

            setTimeout(() => {
                if (confirm('Post sent to group! Go to messages?')) {
                    window.location.href = 'messages.html';
                }
            }, 1500);

        } catch (error) {
            console.error('❌ Error sending post to group:', error);
            alert('Failed to send post to group: ' + (error.message || 'Unknown error'));
        }
    }

    showSuccessNotification(message) {
        const toast = document.createElement('div');
        toast.className = 'success-toast';
        toast.innerHTML = `<div class="toast-content"><i class="fas fa-check-circle"></i><span>${this.escapeHtml(message)}</span></div>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    stripMarkdown(text) {
        if (!text) return '';
        return text.replace(/[#*_~`]/g, '').replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/\n/g, ' ');
    }

    openImageLightbox(imageUrl) {
        let lightbox = document.getElementById('imageLightbox');
        
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.id = 'imageLightbox';
            lightbox.className = 'image-lightbox';
            lightbox.innerHTML = '<button class="image-lightbox-close"><i class="fas fa-times"></i></button><img src="" alt="Full Size Image">';
            document.body.appendChild(lightbox);

            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox || e.target.closest('.image-lightbox-close')) {
                    this.closeImageLightbox();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                    this.closeImageLightbox();
                }
            });
        }

        lightbox.querySelector('img').src = imageUrl;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeImageLightbox() {
        const lightbox = document.getElementById('imageLightbox');
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    async loadComments() {
        try {
            const comments = await window.communityService.getComments(this.postId);
            this.renderComments(comments);
        } catch (error) {
            console.error('❌ Error loading comments:', error);
        }
    }

    renderComments(comments) {
        const commentsCount = document.getElementById('commentsCount');
        const commentsList = document.getElementById('commentsList');

        commentsCount.textContent = `${comments.length} Comment${comments.length !== 1 ? 's' : ''}`;

        if (comments.length === 0) {
            commentsList.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);"><i class="fas fa-comments" style="font-size: 3rem; opacity: 0.3; margin-bottom: 16px;"></i><p>No comments yet. Be the first to comment!</p></div>';
            return;
        }

        commentsList.innerHTML = comments.map(comment => this.renderComment(comment)).join('');
    }

    renderComment(comment) {
        const isAuthor = this.currentUser && comment.authorId === this.currentUser.uid;
        const planBadge = this.getPlanBadge(comment.authorPlan);

        return `
            <div class="comment-item" data-comment-id="${comment.id}">
                <img src="${comment.authorPhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(comment.authorName) + '&background=3B82F6&color=fff'}" 
                    alt="${comment.authorName}" class="comment-avatar"
                    onclick="window.location.href='public-profile.html?id=${comment.authorId}'" style="cursor: pointer;">
                <div class="comment-content-wrapper">
                    <div class="comment-header">
                        <div class="comment-author" onclick="window.location.href='public-profile.html?id=${comment.authorId}'" style="cursor: pointer;">
                            ${comment.authorName} ${planBadge}
                        </div>
                        <div class="comment-date">${this.formatDate(comment.createdAt)}</div>
                    </div>
                    <div class="comment-text">${this.escapeHtml(comment.content)}</div>
                    ${isAuthor ? `<button class="comment-delete-btn" onclick="window.postManager.deleteComment('${comment.id}')"><i class="fas fa-trash-alt"></i> Delete</button>` : ''}
                </div>
            </div>
        `;
    }

    async deleteComment(commentId) {
        if (!confirm('Delete this comment?')) return;

        try {
            await window.communityService.deleteComment(commentId, this.postId);
            await this.loadComments();
            
            this.post.commentsCount = Math.max(0, (this.post.commentsCount || 0) - 1);
            document.querySelector('.post-stats .stat-item:nth-child(3)').innerHTML = `<i class="fas fa-comments"></i> ${this.post.commentsCount} comments`;
        } catch (error) {
            console.error('❌ Error deleting comment:', error);
            alert('Failed to delete comment');
        }
    }

    getChannelBadge(channelId) {
        const channel = this.channels.find(c => c.id === channelId);

        if (channel) {
            return `<div class="channel-badge" style="background: linear-gradient(135deg, #3B82F615, #3B82F630); border-left: 4px solid #3B82F6;"><span>${channel.icon}</span><span>${channel.name}</span></div>`;
        }

        console.warn('⚠ Channel not found:', channelId);
        return '<div class="channel-badge" style="background: linear-gradient(135deg, #6B728015, #6B728030); border-left: 4px solid #6B7280;"><span>📝</span><span>General</span></div>';
    }

    getPlanBadge(plan) {
        const plans = {
            'platinum': '<span class="plan-badge platinum"><i class="fas fa-crown"></i> Platinum</span>',
            'pro': '<span class="plan-badge pro"><i class="fas fa-star"></i> Pro</span>',
            'basic': '<span class="plan-badge basic">Basic</span>',
            'free': ''
        };
        return plans[plan] || '';
    }

    formatDate(timestamp) {
        if (!timestamp) return 'Just now';

        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        this.postContainer.innerHTML = `
            <div style="text-align: center; padding: 60px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #EF4444; margin-bottom: 24px;"></i>
                <h2 style="color: var(--text-primary); margin-bottom: 12px;">Error Loading Post</h2>
                <p style="color: var(--text-secondary);">${message}</p>
                <button class="filter-btn" onclick="window.location.href='community-hub.html'" style="margin-top: 24px;">
                    <i class="fas fa-arrow-left"></i> Back to Community
                </button>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.postManager = new PostManager();
    window.postManager.initialize();
});