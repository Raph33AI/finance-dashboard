/* ============================================
   ALPHAVAULT AI - POST MANAGER
   Gestion de l'Affichage des Posts Individuels
   ============================================ */

class PostManager {
    constructor() {
        this.postId = null;
        this.post = null;
        this.postDetailCard = document.getElementById('postDetailCard');
        this.postLoading = document.getElementById('postLoading');
        this.commentsSection = document.getElementById('commentsSection');
    }

    async initialize() {
        try {
            console.log('📄 Initializing Post Manager...');
            
            // Get post ID from URL
            this.postId = this.getPostIdFromUrl();
            
            if (!this.postId) {
                this.showError('Post not found');
                return;
            }

            // Load post
            await this.loadPost();
            
            // Load comments
            if (window.commentSystem) {
                await window.commentSystem.initialize(this.postId);
            }
            
            console.log('✅ Post Manager initialized');
        } catch (error) {
            console.error('❌ Error initializing Post Manager:', error);
            this.showError('Failed to load post');
        }
    }

    getPostIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    async loadPost() {
        try {
            this.post = await window.communityService.getPost(this.postId);
            this.renderPost();
            
            // Show comments section
            this.commentsSection.style.display = 'block';
            
            // Increment views
            await this.incrementViews();
            
        } catch (error) {
            console.error('❌ Error loading post:', error);
            throw error;
        }
    }

    renderPost() {
        if (!this.post) return;

        // Get channel info
        const channelIcon = this.getChannelIconFA(this.post.channelId);
        const channelName = this.getChannelName(this.post.channelId);

        // Format date
        const postDate = this.formatDate(this.post.createdAt);
        const timeAgo = this.formatTimeAgo(this.post.createdAt);

        // Render markdown content
        const renderedContent = this.renderMarkdown(this.post.content);

        // Check if current user has upvoted
        const currentUser = firebase.auth().currentUser;
        const hasUpvoted = currentUser && this.post.upvotedBy?.includes(currentUser.uid);

        // Tags HTML
        const tagsHTML = this.post.tags && this.post.tags.length > 0 ? `
            <div class="post-tags" style="margin-bottom: 24px;">
                ${this.post.tags.map(tag => `
                    <span class="post-tag">#${this.escapeHtml(tag)}</span>
                `).join('')}
            </div>
        ` : '';

        // Images HTML
        const imagesHTML = this.post.images && this.post.images.length > 0 ? `
            <div class="post-detail-images">
                ${this.post.images.map(img => `
                    <img src="${img}" alt="Post image" onclick="window.open('${img}', '_blank')">
                `).join('')}
            </div>
        ` : '';

        // Author avatar (utilise la photo ou un avatar généré)
        // ✅ Essayer authorPhoto, puis authorAvatar, puis générer un avatar
        const authorAvatar = this.post.authorPhoto || this.post.authorAvatar || 
            `https://ui-avatars.com/api/?name=${encodeURIComponent(this.post.authorName)}&background=667eea&color=fff&size=128`;

        // Verified badge
        const verifiedBadge = this.post.authorBadges?.includes('verified-analyst') ? 
            '<i class="fas fa-check-circle" style="color: #10b981; margin-left: 8px;"></i>' : '';

        // Admin actions (si l'utilisateur est l'auteur ou admin)
        const isAuthor = currentUser && currentUser.uid === this.post.authorId;
        const isAdmin = currentUser && currentUser.email === 'raph.nardone@gmail.com'; // À adapter selon ton système
        
        const adminActionsHTML = (isAuthor || isAdmin) ? `
            <div style="margin-top: 32px; padding-top: 24px; border-top: 2px solid var(--glass-border); display: flex; gap: 12px; flex-wrap: wrap;">
                <button class="btn-cancel" onclick="window.postManager.editPost()">
                    <i class="fas fa-edit"></i> Edit Post
                </button>
                <button class="btn-cancel" onclick="window.postManager.deletePost()" style="color: #ef4444; border-color: #ef4444;">
                    <i class="fas fa-trash"></i> Delete Post
                </button>
            </div>
        ` : '';

        const postHTML = `
            <!-- Channel Badge -->
            <div class="post-detail-channel">
                <i class="fas ${channelIcon}"></i>
                ${channelName}
            </div>
            
            <!-- Title -->
            <h1 class="post-detail-title">${this.escapeHtml(this.post.title)}</h1>
            
            <!-- Author Info & Stats -->
            <div class="post-detail-author">
                <img 
                    src="${authorAvatar}" 
                    alt="${this.escapeHtml(this.post.authorName)}" 
                    class="post-detail-author-avatar clickable-author"
                    data-author-id="${this.post.authorId}"
                    onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(this.post.authorName)}&background=667eea&color=fff&size=128'"
                    style="cursor: pointer;"
                >
                <div class="post-detail-author-info">
                    <div class="post-detail-author-name clickable-author" data-author-id="${this.post.authorId}" style="cursor: pointer;">
                        ${this.escapeHtml(this.post.authorName)}
                        ${verifiedBadge}
                    </div>
                    <div class="post-detail-date">
                        <i class="fas fa-calendar-alt"></i>
                        ${postDate} (${timeAgo})
                    </div>
                </div>
                
                <!-- Stats -->
                <div class="post-detail-stats">
                    <div class="post-detail-stat ${hasUpvoted ? 'liked' : ''}" id="upvoteBtn" style="cursor: pointer;">
                        <i class="fas fa-arrow-up"></i>
                        <span id="upvoteCount">${this.post.upvotes || 0}</span>
                    </div>
                    <div class="post-detail-stat">
                        <i class="fas fa-comment"></i>
                        <span id="commentCountPost">${this.post.commentCount || 0}</span>
                    </div>
                    <div class="post-detail-stat">
                        <i class="fas fa-eye"></i>
                        <span>${this.post.viewCount || 0}</span>
                    </div>
                </div>
            </div>
            
            <!-- Tags -->
            ${tagsHTML}
            
            <!-- Content -->
            <div class="post-detail-content">
                ${renderedContent}
            </div>
            
            <!-- Images -->
            ${imagesHTML}
            
            <!-- Admin Actions -->
            ${adminActionsHTML}
        `;

        this.postDetailCard.innerHTML = postHTML;

        // Add click handlers for author profile
        document.querySelectorAll('.clickable-author').forEach(el => {
            el.addEventListener('click', () => {
                const authorId = el.dataset.authorId;
                if (authorId) {
                    window.location.href = `public-profile.html?uid=${authorId}`;
                }
            });
        });

        // Update page title
        document.title = `${this.post.title} - AlphaVault AI Community`;

        // Add upvote handler
        const upvoteBtn = document.getElementById('upvoteBtn');
        if (upvoteBtn && currentUser) {
            upvoteBtn.addEventListener('click', () => this.handleUpvote());
        }

        // Highlight code blocks
        if (typeof hljs !== 'undefined') {
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }
    }

    async handleUpvote() {
        try {
            const currentUser = firebase.auth().currentUser;
            if (!currentUser) {
                alert('Please sign in to upvote');
                return;
            }

            await window.communityService.upvotePost(this.postId);
            
            // Reload post to get updated data
            this.post = await window.communityService.getPost(this.postId);
            
            // Update UI
            const upvoteBtn = document.getElementById('upvoteBtn');
            const upvoteCount = document.getElementById('upvoteCount');
            
            if (upvoteCount) {
                upvoteCount.textContent = this.post.upvotes || 0;
            }
            
            const hasUpvoted = currentUser && this.post.upvotedBy?.includes(currentUser.uid);
            
            if (upvoteBtn) {
                if (hasUpvoted) {
                    upvoteBtn.classList.add('liked');
                } else {
                    upvoteBtn.classList.remove('liked');
                }
            }
            
        } catch (error) {
            console.error('❌ Error upvoting post:', error);
            alert('Failed to upvote post');
        }
    }

    async incrementViews() {
        try {
            // Increment view count
            await firebase.firestore()
                .collection('community_posts')  // ✅ CORRECT
                .doc(this.postId)
                .update({
                    viewCount: firebase.firestore.FieldValue.increment(1)
                });
        } catch (error) {
            console.error('❌ Error incrementing views:', error);
        }
    }

    renderMarkdown(markdown) {
        if (typeof marked === 'undefined') {
            console.warn('⚠ Marked.js not loaded, returning raw markdown');
            return this.escapeHtml(markdown).replace(/\n/g, '<br>');
        }

        // Configure marked.js
        marked.setOptions({
            highlight: function(code, lang) {
                if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (err) {
                        console.warn('Highlight error:', err);
                    }
                }
                if (typeof hljs !== 'undefined') {
                    return hljs.highlightAuto(code).value;
                }
                return code;
            },
            breaks: true,
            gfm: true,
            headerIds: true,
            mangle: false
        });

        return marked.parse(markdown);
    }

    getChannelIconFA(channelId) {
        const channelIcons = {
            'market-analysis': 'fa-chart-line',
            'ma-intelligence': 'fa-handshake',
            'trading-strategies': 'fa-bullseye',
            'ipo-watch': 'fa-rocket',
            'portfolio-reviews': 'fa-chart-pie',
            'ai-quant': 'fa-robot',
            'ideas-insights': 'fa-lightbulb',
            'news-events': 'fa-newspaper',
            'education': 'fa-graduation-cap',
            'success-stories': 'fa-trophy'
        };
        return channelIcons[channelId] || 'fa-folder';
    }

    getChannelName(channelId) {
        const channelNames = {
            'market-analysis': 'Market Analysis',
            'ma-intelligence': 'M&A Intelligence',
            'trading-strategies': 'Trading Strategies',
            'ipo-watch': 'IPO Watch',
            'portfolio-reviews': 'Portfolio Reviews',
            'ai-quant': 'AI & Quant',
            'ideas-insights': 'Ideas & Insights',
            'news-events': 'News & Events',
            'education': 'Education',
            'success-stories': 'Success Stories'
        };
        return channelNames[channelId] || 'General';
    }

    formatDate(date) {
        if (!date) return 'Unknown';
        
        // Si c'est un timestamp Firestore
        if (date.seconds) {
            date = new Date(date.seconds * 1000);
        } else if (!(date instanceof Date)) {
            date = new Date(date);
        }
        
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return date.toLocaleDateString('en-US', options);
    }

    formatTimeAgo(date) {
        if (!date) return 'Just now';
        
        // Si c'est un timestamp Firestore
        if (date.seconds) {
            date = new Date(date.seconds * 1000);
        } else if (!(date instanceof Date)) {
            date = new Date(date);
        }
        
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
                return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
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

    showError(message) {
        this.postLoading.style.display = 'none';
        this.postDetailCard.innerHTML = `
            <div style="text-align: center; padding: 60px; color: var(--text-secondary);">
                <i class="fas fa-exclamation-triangle" style="font-size: 4rem; margin-bottom: 20px; color: #ef4444;"></i>
                <h3 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 12px; color: var(--text-primary);">${this.escapeHtml(message)}</h3>
                <p style="margin-bottom: 24px; color: var(--text-secondary);">The post you're looking for doesn't exist or has been removed.</p>
                <a href="community-hub.html" class="create-post-btn" style="display: inline-flex; text-decoration: none;">
                    <i class="fas fa-arrow-left"></i> Back to Community
                </a>
            </div>
        `;
    }

    // Méthodes pour les actions admin
    editPost() {
        if (!this.post) return;
        
        // Rediriger vers la page d'édition (à implémenter)
        alert('Edit feature coming soon!');
        // window.location.href = `edit-post.html?id=${this.postId}`;
    }

    async deletePost() {
        if (!this.post) return;
        
        const confirmDelete = confirm('Are you sure you want to delete this post? This action cannot be undone.');
        
        if (!confirmDelete) return;
        
        try {
            await firebase.firestore()
                .collection('community_posts')  // ✅ CORRECT
                .doc(this.postId)
                .delete();
            
            alert('Post deleted successfully');
            window.location.href = 'community-hub.html';
            
        } catch (error) {
            console.error('❌ Error deleting post:', error);
            alert('Failed to delete post');
        }
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.postManager = new PostManager();
    window.postManager.initialize();
});