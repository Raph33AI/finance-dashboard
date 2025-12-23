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
            
        } catch (error) {
            console.error('❌ Error loading post:', error);
            throw error;
        }
    }

    renderPost() {
        if (!this.post) return;

        // Get channel info
        const channelGradient = this.getChannelGradient(this.post.channelId);
        const channelIcon = this.getChannelIcon(this.post.channelId);
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
                    <span class="tag">#${tag}</span>
                `).join('')}
            </div>
        ` : '';

        // Images HTML
        const imagesHTML = this.post.images && this.post.images.length > 0 ? `
            <div class="post-images-gallery">
                ${this.post.images.map(img => `
                    <div class="post-image-item" onclick="window.open('${img}', '_blank')">
                        <img src="${img}" alt="Post image">
                    </div>
                `).join('')}
            </div>
        ` : '';

        // Verified badge
        const verifiedBadge = this.post.authorBadges?.includes('verified-analyst') ? 
            '<i class="fas fa-badge-check verified-badge"></i>' : '';

        const postHTML = `
            <div class="post-detail-header">
                <div class="post-detail-title">${this.escapeHtml(this.post.title)}</div>
                
                <div class="post-detail-meta">
                    <div class="post-author-detail">
                        <div class="author-avatar-large" style="background: ${channelGradient};">
                            ${this.post.authorName.charAt(0).toUpperCase()}
                        </div>
                        <div class="author-detail-info">
                            <h3>
                                ${this.post.authorName}
                                ${verifiedBadge}
                            </h3>
                            <p>
                                <i class="fas fa-calendar"></i> ${postDate} (${timeAgo})
                            </p>
                        </div>
                    </div>
                    
                    <div class="channel-badge" style="background: ${channelGradient};">
                        <span>${channelIcon}</span>
                        <span>${channelName}</span>
                    </div>
                </div>
            </div>

            ${tagsHTML}

            ${imagesHTML}

            <div class="post-content">
                ${renderedContent}
            </div>

            <div class="post-footer" style="border-top: 2px solid rgba(255, 255, 255, 0.1); padding-top: 24px;">
                <div class="post-stats">
                    <button class="stat-btn ${hasUpvoted ? 'upvoted' : ''}" id="upvoteBtn">
                        <i class="fas fa-arrow-up"></i>
                        <span id="upvoteCount">${this.post.upvotes || 0}</span>
                    </button>
                    <button class="stat-btn">
                        <i class="fas fa-comment"></i>
                        <span id="commentCountPost">${this.post.commentCount || 0}</span>
                    </button>
                    <button class="stat-btn">
                        <i class="fas fa-eye"></i>
                        <span>${this.post.viewCount || 0}</span>
                    </button>
                </div>
            </div>
        `;

        this.postDetailCard.innerHTML = postHTML;

        // Update page title
        document.title = `${this.post.title} - AlphaVault AI Community`;

        // Add upvote handler
        const upvoteBtn = document.getElementById('upvoteBtn');
        if (upvoteBtn) {
            upvoteBtn.addEventListener('click', () => this.handleUpvote());
        }
    }

    async handleUpvote() {
        try {
            await window.communityService.upvotePost(this.postId);
            
            // Reload post to get updated data
            this.post = await window.communityService.getPost(this.postId);
            
            // Update UI
            const upvoteBtn = document.getElementById('upvoteBtn');
            const upvoteCount = document.getElementById('upvoteCount');
            
            if (upvoteCount) {
                upvoteCount.textContent = this.post.upvotes || 0;
            }
            
            const currentUser = firebase.auth().currentUser;
            const hasUpvoted = currentUser && this.post.upvotedBy?.includes(currentUser.uid);
            
            if (upvoteBtn) {
                upvoteBtn.classList.toggle('upvoted', hasUpvoted);
            }
            
        } catch (error) {
            console.error('❌ Error upvoting post:', error);
        }
    }

    renderMarkdown(markdown) {
        // Configure marked.js
        marked.setOptions({
            highlight: function(code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (err) {}
                }
                return hljs.highlightAuto(code).value;
            },
            breaks: true,
            gfm: true
        });

        return marked.parse(markdown);
    }

    getChannelGradient(channelId) {
        const channelGradients = {
            'market-analysis': 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            'ma-intelligence': 'linear-gradient(135deg, #8B5CF6, #6366F1)',
            'trading-strategies': 'linear-gradient(135deg, #10B981, #059669)',
            'ipo-watch': 'linear-gradient(135deg, #F59E0B, #D97706)',
            'portfolio-reviews': 'linear-gradient(135deg, #EC4899, #D946EF)',
            'ai-quant': 'linear-gradient(135deg, #06B6D4, #0891B2)',
            'ideas-insights': 'linear-gradient(135deg, #6366F1, #4F46E5)',
            'news-events': 'linear-gradient(135deg, #EF4444, #DC2626)',
            'education': 'linear-gradient(135deg, #EAB308, #CA8A04)',
            'success-stories': 'linear-gradient(135deg, #F59E0B, #FBBF24)'
        };
        return channelGradients[channelId] || 'linear-gradient(135deg, #667eea, #764ba2)';
    }

    getChannelIcon(channelId) {
        const channelIcons = {
            'market-analysis': '📈',
            'ma-intelligence': '💼',
            'trading-strategies': '🎯',
            'ipo-watch': '🚀',
            'portfolio-reviews': '📊',
            'ai-quant': '🤖',
            'ideas-insights': '💡',
            'news-events': '📰',
            'education': '🎓',
            'success-stories': '🏆'
        };
        return channelIcons[channelId] || '📄';
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
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        this.postDetailCard.innerHTML = `
            <div style="text-align: center; padding: 60px; color: #EF4444;">
                <i class="fas fa-exclamation-triangle" style="font-size: 4rem; margin-bottom: 20px;"></i>
                <h3 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 12px; color: white;">${message}</h3>
                <a href="community-hub.html" class="filter-btn" style="display: inline-block; margin-top: 20px; text-decoration: none;">
                    <i class="fas fa-arrow-left"></i> Back to Community
                </a>
            </div>
        `;
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.postManager = new PostManager();
    window.postManager.initialize();
});