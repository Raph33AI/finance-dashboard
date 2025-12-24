// /* ============================================
//    ALPHAVAULT AI - POST MANAGER
//    Gestion de l'Affichage des Posts Individuels
//    ============================================ */

// class PostManager {
//     constructor() {
//         this.postId = null;
//         this.post = null;
//         this.postDetailCard = document.getElementById('postDetailCard');
//         this.postLoading = document.getElementById('postLoading');
//         this.commentsSection = document.getElementById('commentsSection');
//     }

//     async initialize() {
//         try {
//             console.log('📄 Initializing Post Manager...');
            
//             // Get post ID from URL
//             this.postId = this.getPostIdFromUrl();
            
//             if (!this.postId) {
//                 this.showError('Post not found');
//                 return;
//             }

//             // Load post
//             await this.loadPost();
            
//             // Load comments
//             if (window.commentSystem) {
//                 await window.commentSystem.initialize(this.postId);
//             }
            
//             console.log('✅ Post Manager initialized');
//         } catch (error) {
//             console.error('❌ Error initializing Post Manager:', error);
//             this.showError('Failed to load post');
//         }
//     }

//     getPostIdFromUrl() {
//         const urlParams = new URLSearchParams(window.location.search);
//         return urlParams.get('id');
//     }

//     async loadPost() {
//         try {
//             this.post = await window.communityService.getPost(this.postId);
//             this.renderPost();
            
//             // Show comments section
//             this.commentsSection.style.display = 'block';
            
//             // Increment views
//             await this.incrementViews();
            
//         } catch (error) {
//             console.error('❌ Error loading post:', error);
//             throw error;
//         }
//     }

//     renderPost() {
//         if (!this.post) return;

//         // Get channel info
//         const channelIcon = this.getChannelIconFA(this.post.channelId);
//         const channelName = this.getChannelName(this.post.channelId);

//         // Format date
//         const postDate = this.formatDate(this.post.createdAt);
//         const timeAgo = this.formatTimeAgo(this.post.createdAt);

//         // Render markdown content
//         const renderedContent = this.renderMarkdown(this.post.content);

//         // Check if current user has upvoted
//         const currentUser = firebase.auth().currentUser;
//         const hasUpvoted = currentUser && this.post.upvotedBy?.includes(currentUser.uid);

//         // Tags HTML
//         const tagsHTML = this.post.tags && this.post.tags.length > 0 ? `
//             <div class="post-tags" style="margin-bottom: 24px;">
//                 ${this.post.tags.map(tag => `
//                     <span class="post-tag">#${this.escapeHtml(tag)}</span>
//                 `).join('')}
//             </div>
//         ` : '';

//         // Images HTML
//         const imagesHTML = this.post.images && this.post.images.length > 0 ? `
//             <div class="post-detail-images">
//                 ${this.post.images.map(img => `
//                     <img src="${img}" alt="Post image" onclick="window.open('${img}', '_blank')">
//                 `).join('')}
//             </div>
//         ` : '';

//         // Author avatar (utilise la photo ou un avatar généré)
//         // ✅ Essayer authorPhoto, puis authorAvatar, puis générer un avatar
//         const authorAvatar = this.post.authorPhoto || this.post.authorAvatar || 
//             `https://ui-avatars.com/api/?name=${encodeURIComponent(this.post.authorName)}&background=667eea&color=fff&size=128`;

//         // Verified badge
//         const verifiedBadge = this.post.authorBadges?.includes('verified-analyst') ? 
//             '<i class="fas fa-check-circle" style="color: #10b981; margin-left: 8px;"></i>' : '';

//         // Admin actions (si l'utilisateur est l'auteur ou admin)
//         const isAuthor = currentUser && currentUser.uid === this.post.authorId;
//         const isAdmin = currentUser && currentUser.email === 'raph.nardone@gmail.com'; // À adapter selon ton système
        
//         const adminActionsHTML = (isAuthor || isAdmin) ? `
//             <div style="margin-top: 32px; padding-top: 24px; border-top: 2px solid var(--glass-border); display: flex; gap: 12px; flex-wrap: wrap;">
//                 <button class="btn-cancel" onclick="window.postManager.editPost()">
//                     <i class="fas fa-edit"></i> Edit Post
//                 </button>
//                 <button class="btn-cancel" onclick="window.postManager.deletePost()" style="color: #ef4444; border-color: #ef4444;">
//                     <i class="fas fa-trash"></i> Delete Post
//                 </button>
//             </div>
//         ` : '';

//         const postHTML = `
//             <!-- Channel Badge -->
//             <div class="post-detail-channel">
//                 <i class="fas ${channelIcon}"></i>
//                 ${channelName}
//             </div>
            
//             <!-- Title -->
//             <h1 class="post-detail-title">${this.escapeHtml(this.post.title)}</h1>
            
//             <!-- Author Info & Stats -->
//             <div class="post-detail-author">
//                 <img 
//                     src="${authorAvatar}" 
//                     alt="${this.escapeHtml(this.post.authorName)}" 
//                     class="post-detail-author-avatar clickable-author"
//                     data-author-id="${this.post.authorId}"
//                     onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(this.post.authorName)}&background=667eea&color=fff&size=128'"
//                     style="cursor: pointer;"
//                 >
//                 <div class="post-detail-author-info">
//                     <div class="post-detail-author-name clickable-author" data-author-id="${this.post.authorId}" style="cursor: pointer;">
//                         ${this.escapeHtml(this.post.authorName)}
//                         ${verifiedBadge}
//                     </div>
//                     <div class="post-detail-date">
//                         <i class="fas fa-calendar-alt"></i>
//                         ${postDate} (${timeAgo})
//                     </div>
//                 </div>
                
//                 <!-- Stats -->
//                 <div class="post-detail-stats">
//                     <div class="post-detail-stat ${hasUpvoted ? 'liked' : ''}" id="upvoteBtn" style="cursor: pointer;">
//                         <i class="fas fa-arrow-up"></i>
//                         <span id="upvoteCount">${this.post.upvotes || 0}</span>
//                     </div>
//                     <div class="post-detail-stat">
//                         <i class="fas fa-comment"></i>
//                         <span id="commentCountPost">${this.post.commentCount || 0}</span>
//                     </div>
//                     <div class="post-detail-stat">
//                         <i class="fas fa-eye"></i>
//                         <span>${this.post.viewCount || 0}</span>
//                     </div>
//                 </div>
//             </div>
            
//             <!-- Tags -->
//             ${tagsHTML}
            
//             <!-- Content -->
//             <div class="post-detail-content">
//                 ${renderedContent}
//             </div>
            
//             <!-- Images -->
//             ${imagesHTML}
            
//             <!-- Admin Actions -->
//             ${adminActionsHTML}
//         `;

//         this.postDetailCard.innerHTML = postHTML;

//         // Add click handlers for author profile
//         document.querySelectorAll('.clickable-author').forEach(el => {
//             el.addEventListener('click', () => {
//                 const authorId = el.dataset.authorId;
//                 if (authorId) {
//                     window.location.href = `public-profile.html?uid=${authorId}`;
//                 }
//             });
//         });

//         // Update page title
//         document.title = `${this.post.title} - AlphaVault AI Community`;

//         // Add upvote handler
//         const upvoteBtn = document.getElementById('upvoteBtn');
//         if (upvoteBtn && currentUser) {
//             upvoteBtn.addEventListener('click', () => this.handleUpvote());
//         }

//         // Highlight code blocks
//         if (typeof hljs !== 'undefined') {
//             document.querySelectorAll('pre code').forEach((block) => {
//                 hljs.highlightElement(block);
//             });
//         }
//     }

//     async handleUpvote() {
//         try {
//             const currentUser = firebase.auth().currentUser;
//             if (!currentUser) {
//                 alert('Please sign in to upvote');
//                 return;
//             }

//             await window.communityService.upvotePost(this.postId);
            
//             // Reload post to get updated data
//             this.post = await window.communityService.getPost(this.postId);
            
//             // Update UI
//             const upvoteBtn = document.getElementById('upvoteBtn');
//             const upvoteCount = document.getElementById('upvoteCount');
            
//             if (upvoteCount) {
//                 upvoteCount.textContent = this.post.upvotes || 0;
//             }
            
//             const hasUpvoted = currentUser && this.post.upvotedBy?.includes(currentUser.uid);
            
//             if (upvoteBtn) {
//                 if (hasUpvoted) {
//                     upvoteBtn.classList.add('liked');
//                 } else {
//                     upvoteBtn.classList.remove('liked');
//                 }
//             }
            
//         } catch (error) {
//             console.error('❌ Error upvoting post:', error);
//             alert('Failed to upvote post');
//         }
//     }

//     async incrementViews() {
//         try {
//             // Increment view count
//             await firebase.firestore()
//                 .collection('community_posts')  // ✅ CORRECT
//                 .doc(this.postId)
//                 .update({
//                     viewCount: firebase.firestore.FieldValue.increment(1)
//                 });
//         } catch (error) {
//             console.error('❌ Error incrementing views:', error);
//         }
//     }

//     renderMarkdown(markdown) {
//         if (typeof marked === 'undefined') {
//             console.warn('⚠ Marked.js not loaded, returning raw markdown');
//             return this.escapeHtml(markdown).replace(/\n/g, '<br>');
//         }

//         // Configure marked.js
//         marked.setOptions({
//             highlight: function(code, lang) {
//                 if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
//                     try {
//                         return hljs.highlight(code, { language: lang }).value;
//                     } catch (err) {
//                         console.warn('Highlight error:', err);
//                     }
//                 }
//                 if (typeof hljs !== 'undefined') {
//                     return hljs.highlightAuto(code).value;
//                 }
//                 return code;
//             },
//             breaks: true,
//             gfm: true,
//             headerIds: true,
//             mangle: false
//         });

//         return marked.parse(markdown);
//     }

//     getChannelIconFA(channelId) {
//         const channelIcons = {
//             'market-analysis': 'fa-chart-line',
//             'ma-intelligence': 'fa-handshake',
//             'trading-strategies': 'fa-bullseye',
//             'ipo-watch': 'fa-rocket',
//             'portfolio-reviews': 'fa-chart-pie',
//             'ai-quant': 'fa-robot',
//             'ideas-insights': 'fa-lightbulb',
//             'news-events': 'fa-newspaper',
//             'education': 'fa-graduation-cap',
//             'success-stories': 'fa-trophy'
//         };
//         return channelIcons[channelId] || 'fa-folder';
//     }

//     getChannelName(channelId) {
//         const channelNames = {
//             'market-analysis': 'Market Analysis',
//             'ma-intelligence': 'M&A Intelligence',
//             'trading-strategies': 'Trading Strategies',
//             'ipo-watch': 'IPO Watch',
//             'portfolio-reviews': 'Portfolio Reviews',
//             'ai-quant': 'AI & Quant',
//             'ideas-insights': 'Ideas & Insights',
//             'news-events': 'News & Events',
//             'education': 'Education',
//             'success-stories': 'Success Stories'
//         };
//         return channelNames[channelId] || 'General';
//     }

//     formatDate(date) {
//         if (!date) return 'Unknown';
        
//         // Si c'est un timestamp Firestore
//         if (date.seconds) {
//             date = new Date(date.seconds * 1000);
//         } else if (!(date instanceof Date)) {
//             date = new Date(date);
//         }
        
//         const options = { 
//             year: 'numeric', 
//             month: 'long', 
//             day: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit'
//         };
        
//         return date.toLocaleDateString('en-US', options);
//     }

//     formatTimeAgo(date) {
//         if (!date) return 'Just now';
        
//         // Si c'est un timestamp Firestore
//         if (date.seconds) {
//             date = new Date(date.seconds * 1000);
//         } else if (!(date instanceof Date)) {
//             date = new Date(date);
//         }
        
//         const seconds = Math.floor((new Date() - date) / 1000);
        
//         const intervals = {
//             year: 31536000,
//             month: 2592000,
//             week: 604800,
//             day: 86400,
//             hour: 3600,
//             minute: 60
//         };
        
//         for (const [unit, secondsInUnit] of Object.entries(intervals)) {
//             const interval = Math.floor(seconds / secondsInUnit);
//             if (interval >= 1) {
//                 return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
//             }
//         }
        
//         return 'Just now';
//     }

//     escapeHtml(text) {
//         if (!text) return '';
//         const div = document.createElement('div');
//         div.textContent = text;
//         return div.innerHTML;
//     }

//     showError(message) {
//         this.postLoading.style.display = 'none';
//         this.postDetailCard.innerHTML = `
//             <div style="text-align: center; padding: 60px; color: var(--text-secondary);">
//                 <i class="fas fa-exclamation-triangle" style="font-size: 4rem; margin-bottom: 20px; color: #ef4444;"></i>
//                 <h3 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 12px; color: var(--text-primary);">${this.escapeHtml(message)}</h3>
//                 <p style="margin-bottom: 24px; color: var(--text-secondary);">The post you're looking for doesn't exist or has been removed.</p>
//                 <a href="community-hub.html" class="create-post-btn" style="display: inline-flex; text-decoration: none;">
//                     <i class="fas fa-arrow-left"></i> Back to Community
//                 </a>
//             </div>
//         `;
//     }

//     // Méthodes pour les actions admin
//     editPost() {
//         if (!this.post) return;
        
//         // Rediriger vers la page d'édition (à implémenter)
//         alert('Edit feature coming soon!');
//         // window.location.href = `edit-post.html?id=${this.postId}`;
//     }

//     async deletePost() {
//         if (!this.post) return;
        
//         const confirmDelete = confirm('Are you sure you want to delete this post? This action cannot be undone.');
        
//         if (!confirmDelete) return;
        
//         try {
//             await firebase.firestore()
//                 .collection('community_posts')  // ✅ CORRECT
//                 .doc(this.postId)
//                 .delete();
            
//             alert('Post deleted successfully');
//             window.location.href = 'community-hub.html';
            
//         } catch (error) {
//             console.error('❌ Error deleting post:', error);
//             alert('Failed to delete post');
//         }
//     }
// }

// // Initialize on DOM load
// document.addEventListener('DOMContentLoaded', () => {
//     window.postManager = new PostManager();
//     window.postManager.initialize();
// });

/* ============================================
   ALPHAVAULT AI - POST MANAGER
   Affichage et gestion des posts (CORRIGÉ)
   ============================================ */

class PostManager {
    constructor() {
        this.postId = null;
        this.post = null;
        this.currentUser = null;
        this.channels = []; // ✅ Stocker les channels
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

            // ✅ CORRECTION 1 : Charger les channels AVANT le post
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

    // ✅ CORRECTION 2 : Charger les channels
    async loadChannels() {
        try {
            this.channels = await window.communityService.getChannels();
            console.log('📂 Channels loaded:', this.channels.length);
        } catch (error) {
            console.error('❌ Error loading channels:', error);
            this.channels = []; // Fallback vide
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
                        <!-- ✅ CORRECTION 3 : Lien cliquable vers le profil -->
                        <img src="${this.post.authorPhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.post.authorName) + '&background=3B82F6&color=fff'}" 
                             alt="${this.post.authorName}" 
                             class="author-avatar"
                             onclick="window.location.href='user-profile.html?id=${this.post.authorId}'"
                             style="cursor: pointer;">
                        <div class="author-info">
                            <div class="author-name" onclick="window.location.href='user-profile.html?id=${this.post.authorId}'" style="cursor: pointer;">
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

        return `
            <div class="post-content">
                ${htmlContent}
            </div>
        `;
    }

    renderPostImages() {
        if (!this.post.images || this.post.images.length === 0) {
            return '';
        }

        const imagesHTML = this.post.images.map((imageUrl, index) => `
            <div class="post-image-wrapper" data-image-index="${index}">
                <img src="${imageUrl}" alt="Post Image ${index + 1}" loading="lazy">
            </div>
        `).join('');

        return `
            <div class="post-images-grid">
                ${imagesHTML}
            </div>
        `;
    }

    renderPostTags() {
        if (!this.post.tags || this.post.tags.length === 0) {
            return '';
        }

        const tagsHTML = this.post.tags.map(tag => `
            <a href="community-hub.html?tag=${encodeURIComponent(tag)}" class="post-tag">
                #${tag}
            </a>
        `).join('');

        return `
            <div class="post-tags">
                ${tagsHTML}
            </div>
        `;
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
        if (likeBtn) {
            likeBtn.addEventListener('click', () => this.handleLike());
        }

        const editBtn = this.postContainer.querySelector('[data-action="edit"]');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.handleEdit());
        }

        const deleteBtn = this.postContainer.querySelector('[data-action="delete"]');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.handleDelete());
        }

        const shareBtn = this.postContainer.querySelector('[data-action="share"]');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.handleShare());
        }

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
        if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            return;
        }

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

        if (navigator.share) {
            navigator.share({
                title: this.post.title,
                text: 'Check out this post on AlphaVault AI Community',
                url: postUrl
            }).catch(err => console.log('Share cancelled'));
        } else {
            navigator.clipboard.writeText(postUrl).then(() => {
                alert('Link copied to clipboard!');
            });
        }
    }

    openImageLightbox(imageUrl) {
        let lightbox = document.getElementById('imageLightbox');
        
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.id = 'imageLightbox';
            lightbox.className = 'image-lightbox';
            lightbox.innerHTML = `
                <button class="image-lightbox-close">
                    <i class="fas fa-times"></i>
                </button>
                <img src="" alt="Full Size Image">
            `;
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

        const img = lightbox.querySelector('img');
        img.src = imageUrl;
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
            commentsList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <i class="fas fa-comments" style="font-size: 3rem; opacity: 0.3; margin-bottom: 16px;"></i>
                    <p>No comments yet. Be the first to comment!</p>
                </div>
            `;
            return;
        }

        commentsList.innerHTML = comments.map(comment => this.renderComment(comment)).join('');
    }

    renderComment(comment) {
        const isAuthor = this.currentUser && comment.authorId === this.currentUser.uid;
        const planBadge = this.getPlanBadge(comment.authorPlan);

        return `
            <div class="comment-item" data-comment-id="${comment.id}">
                <!-- ✅ CORRECTION 4 : Avatar cliquable -->
                <img src="${comment.authorPhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(comment.authorName) + '&background=3B82F6&color=fff'}" 
                     alt="${comment.authorName}" 
                     class="comment-avatar"
                     onclick="window.location.href='user-profile.html?id=${comment.authorId}'"
                     style="cursor: pointer;">
                <div class="comment-content-wrapper">
                    <div class="comment-header">
                        <div class="comment-author" onclick="window.location.href='user-profile.html?id=${comment.authorId}'" style="cursor: pointer;">
                            ${comment.authorName}
                            ${planBadge}
                        </div>
                        <div class="comment-date">
                            ${this.formatDate(comment.createdAt)}
                        </div>
                    </div>
                    <div class="comment-text">
                        ${this.escapeHtml(comment.content)}
                    </div>
                    ${isAuthor ? `
                        <button class="comment-delete-btn" onclick="window.postManager.deleteComment('${comment.id}')">
                            <i class="fas fa-trash-alt"></i> Delete
                        </button>
                    ` : ''}
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
            document.querySelector('.post-stats .stat-item:nth-child(3)').innerHTML = `
                <i class="fas fa-comments"></i>
                ${this.post.commentsCount} comments
            `;
        } catch (error) {
            console.error('❌ Error deleting comment:', error);
            alert('Failed to delete comment');
        }
    }

    // ✅ CORRECTION 5 : Mapping corrigé des nouveaux channels
    getChannelBadge(channelId) {
        // Chercher le channel dans les channels chargés
        const channel = this.channels.find(c => c.id === channelId);

        if (channel) {
            return `
                <div class="channel-badge" style="background: linear-gradient(135deg, #3B82F615, #3B82F630); border-left: 4px solid #3B82F6;">
                    <span>${channel.icon}</span>
                    <span>${channel.name}</span>
                </div>
            `;
        }

        // Fallback si channel non trouvé
        console.warn('⚠ Channel not found:', channelId);
        return `
            <div class="channel-badge" style="background: linear-gradient(135deg, #6B728015, #6B728030); border-left: 4px solid #6B7280;">
                <span>📝</span>
                <span>General</span>
            </div>
        `;
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