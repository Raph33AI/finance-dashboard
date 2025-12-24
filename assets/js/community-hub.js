/* ============================================
   ALPHAVAULT AI - COMMUNITY HUB
   Logique Principale de la Page Hub
   ============================================ */

class CommunityHub {
    constructor() {
        this.postsGrid = document.getElementById('postsGrid');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.loadMoreBtn = document.getElementById('loadMoreBtn');
        this.searchInput = document.getElementById('searchInput');
        
        this.currentChannel = 'all';
        this.currentFilter = 'trending';
        this.lastDoc = null;
        this.isLoading = false;
        this.searchTimeout = null;
    }

    async initialize() {
        try {
            console.log('🚀 Initializing Community Hub...');
            
            // Initialize channels first
            await window.channelManager.initialize();
            
            // Load initial posts
            await this.loadPosts('all');
            
            // Load sidebar data
            await this.loadSidebarData();
            
            // Load community stats
            await this.loadCommunityStats();
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('✅ Community Hub initialized');
        } catch (error) {
            console.error('❌ Error initializing Community Hub:', error);
        }
    }

    setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                if (filter) {
                    this.setFilter(filter);
                }
            });
        });

        // Load more button
        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => {
                this.loadMorePosts();
            });
        }

        // Search input
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.searchPosts(e.target.value);
                }, 500);
            });
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update UI
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        // Reload posts
        this.loadPosts(this.currentChannel);
        
        console.log('🔍 Filter set to:', filter);
    }

    async loadPosts(channelId = 'all', append = false) {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            this.currentChannel = channelId;
            
            if (!append) {
                this.showLoading();
                this.lastDoc = null;
            }

            // ✅ NOUVEAU : Gestion du filtre "Following"
            if (this.currentFilter === 'following') {
                await this.loadFollowingPosts();
                return;
            }

            // Determine order
            let orderBy = 'createdAt';
            let orderDirection = 'desc';

            if (this.currentFilter === 'trending') {
                orderBy = 'upvotes';
            } else if (this.currentFilter === 'top') {
                orderBy = 'viewCount';
            }

            const result = await window.communityService.getPosts({
                channelId: channelId === 'all' ? null : channelId,
                limit: 10,  // ✅ Pagination à 10
                orderBy,
                orderDirection,
                lastDoc: append ? this.lastDoc : null
            });

            if (!append) {
                this.postsGrid.innerHTML = '';
            }

            if (result.posts.length === 0 && !append) {
                this.showEmptyState();
            } else {
                this.renderPosts(result.posts);
                this.lastDoc = result.lastDoc;
                
                if (this.loadMoreBtn) {
                    this.loadMoreBtn.style.display = result.hasMore ? 'inline-flex' : 'none';
                }
            }

        } catch (error) {
            console.error('❌ Error loading posts:', error);
            this.showError('Failed to load posts. Please try again.');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    async loadFollowingPosts() {
        try {
            const currentUser = firebase.auth().currentUser;
            
            if (!currentUser) {
                this.showEmptyState('Please sign in to see posts from people you follow');
                return;
            }

            // Récupérer les posts des utilisateurs suivis
            const posts = await window.followSystem.getFollowingPosts(20);

            this.postsGrid.innerHTML = '';

            if (posts.length === 0) {
                this.showEmptyState('No posts from people you follow. Start following users to see their posts here!');
            } else {
                this.renderPosts(posts);
            }

            // Cacher le bouton "Load More" pour le filtre Following
            if (this.loadMoreBtn) {
                this.loadMoreBtn.style.display = 'none';
            }

            this.hideLoading();

        } catch (error) {
            console.error('❌ Error loading following posts:', error);
            this.showError('Failed to load posts from people you follow');
        }
    }

    async loadMorePosts() {
        await this.loadPosts(this.currentChannel, true);
    }

    renderPosts(posts) {
        const postsHTML = posts.map(post => this.createPostCard(post)).join('');
        this.postsGrid.insertAdjacentHTML('beforeend', postsHTML);
        
        // Add click handlers
        this.postsGrid.querySelectorAll('.post-card').forEach(card => {
            const postId = card.dataset.postId;
            
            card.addEventListener('click', (e) => {
                // Don't navigate if clicking on buttons
                if (e.target.closest('.post-stat')) return;
                
                window.location.href = `post.html?id=${postId}`;
            });
            
            // Upvote button
            const upvoteBtn = card.querySelector('.upvote-btn');
            if (upvoteBtn) {
                upvoteBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    await this.handleUpvote(postId, upvoteBtn);
                });
            }
        });
    }

    createPostCard(post) {
        const channel = window.channelManager.getChannel(post.channelId);
        const channelIconFA = this.getChannelIconFA(post.channelId);
        const channelName = channel ? channel.name : 'General';
        
        const timeAgo = this.formatTimeAgo(post.createdAt);
        const excerpt = this.createExcerpt(post.content, 150);
        
        // Tags HTML
        const tagsHTML = post.tags && post.tags.length > 0 ? `
            <div class="post-tags">
                ${post.tags.slice(0, 5).map(tag => `
                    <span class="post-tag">#${this.escapeHtml(tag)}</span>
                `).join('')}
            </div>
        ` : '';

        // Verified badge
        const verifiedBadge = post.authorBadges?.includes('verified-analyst') ? 
            '<i class="fas fa-check-circle" style="color: #10b981; margin-left: 6px; font-size: 0.9rem;"></i>' : '';

        // Check if user upvoted
        const currentUser = firebase.auth().currentUser;
        const hasUpvoted = currentUser && post.upvotedBy?.includes(currentUser.uid);

        // Author avatar
        const authorAvatar = post.authorAvatar ||  // ✅ Déjà correct dans votre code
            `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName)}&background=667eea&color=fff&size=64`;

        return `
            <div class="post-card" data-post-id="${post.id}">
                <!-- Header -->
                <div class="post-header">
                    <div class="post-author">
                        <img 
                            src="${authorAvatar}" 
                            alt="${this.escapeHtml(post.authorName)}" 
                            class="author-avatar"
                            onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName)}&background=667eea&color=fff&size=64'"
                        >
                        <div class="author-info">
                            <div class="author-name">
                                ${this.escapeHtml(post.authorName)}
                                ${verifiedBadge}
                            </div>
                            <div class="post-date">
                                <i class="fas fa-clock"></i> ${timeAgo}
                            </div>
                        </div>
                    </div>
                    
                    <!-- ✅ CORRECTION : Badge channel SANS style inline -->
                    <div class="post-channel">
                        <i class="fas ${channelIconFA}"></i>
                        ${channelName}
                    </div>
                </div>

                <!-- Content -->
                <div class="post-content">
                    <h3 class="post-title">${this.escapeHtml(post.title)}</h3>
                    <p class="post-excerpt">${excerpt}</p>
                </div>
                
                <!-- Tags -->
                ${tagsHTML}

                <!-- Footer -->
                <div class="post-footer">
                    <div class="post-author">
                        <!-- Left side - could add additional info here -->
                    </div>
                    <div class="post-stats">
                        <div class="post-stat upvote-btn ${hasUpvoted ? 'upvoted' : ''}" style="cursor: pointer;">
                            <i class="fas fa-arrow-up"></i>
                            <span>${post.upvotes || 0}</span>
                        </div>
                        <div class="post-stat">
                            <i class="fas fa-comment"></i>
                            <span>${post.commentCount || 0}</span>
                        </div>
                        <div class="post-stat">
                            <i class="fas fa-eye"></i>
                            <span>${post.viewCount || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
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

    async handleUpvote(postId, buttonElement) {
        try {
            const currentUser = firebase.auth().currentUser;
            if (!currentUser) {
                alert('Please sign in to upvote');
                return;
            }

            await window.communityService.upvotePost(postId);
            
            // Update UI
            const post = await window.communityService.getPost(postId);
            const countSpan = buttonElement.querySelector('span');
            if (countSpan) {
                countSpan.textContent = post.upvotes || 0;
            }
            
            const hasUpvoted = currentUser && post.upvotedBy?.includes(currentUser.uid);
            
            if (hasUpvoted) {
                buttonElement.classList.add('upvoted');
            } else {
                buttonElement.classList.remove('upvoted');
            }
            
        } catch (error) {
            console.error('❌ Error upvoting post:', error);
            alert('Failed to upvote post');
        }
    }

    async loadSidebarData() {
        try {
            // Load featured posts
            const featuredPosts = await window.communityService.getFeaturedPosts(3);
            this.renderFeaturedPosts(featuredPosts);

            // Load leaderboard
            const topContributors = await window.communityService.getTopContributors(5);
            this.renderLeaderboard(topContributors);

            // Load trending tags
            const trendingTags = await window.communityService.getTrendingTags(10);
            this.renderTrendingTags(trendingTags);

        } catch (error) {
            console.error('❌ Error loading sidebar data:', error);
        }
    }

    renderFeaturedPosts(posts) {
        const container = document.getElementById('featuredPosts');
        if (!container) return;

        if (posts.length === 0) {
            container.innerHTML = `
                <div class="featured-posts-empty">
                    <i class="fas fa-inbox"></i>
                    <p>No featured posts yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = posts.map(post => {
            const timeAgo = this.formatTimeAgo(post.createdAt);
            
            return `
                <div class="featured-post" onclick="window.location.href='post.html?id=${post.id}'">
                    <div class="featured-post-title">
                        ${this.escapeHtml(post.title)}
                    </div>
                    <div class="featured-post-meta">
                        <span><i class="fas fa-arrow-up"></i> ${post.upvotes || 0}</span>
                        <span><i class="fas fa-comment"></i> ${post.commentCount || 0}</span>
                        <span><i class="fas fa-clock"></i> ${timeAgo}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderLeaderboard(users) {
        const container = document.getElementById('leaderboardList');
        if (!container) return;

        if (users.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--text-secondary); font-size: 0.9rem;">
                    No contributors yet
                </div>
            `;
            return;
        }

        container.innerHTML = users.map((user, index) => {
            const rankClass = index === 0 ? 'top-1' : index === 1 ? 'top-2' : index === 2 ? 'top-3' : '';
            const avatar = user.photoURL || 
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=667eea&color=fff&size=64`;
            
            return `
                <div class="leaderboard-item">
                    <div class="leaderboard-rank ${rankClass}">${index + 1}</div>
                    <img 
                        src="${avatar}" 
                        alt="${this.escapeHtml(user.displayName || user.email)}" 
                        class="leaderboard-avatar"
                        onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=667eea&color=fff&size=64'"
                    >
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">
                            ${this.escapeHtml(user.displayName || user.email.split('@')[0])}
                        </div>
                        <div class="leaderboard-points">
                            ${user.reputation || 0} points
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderTrendingTags(tags) {
        const container = document.getElementById('trendingTags');
        if (!container) return;

        if (tags.length === 0) {
            container.innerHTML = `
                <span class="post-tag" style="opacity: 0.5;">No trending tags</span>
            `;
            return;
        }

        container.innerHTML = tags.map(({ tag, count }) => `
            <span class="post-tag" style="cursor: pointer;" onclick="document.getElementById('searchInput').value='#${tag}'; document.getElementById('searchInput').dispatchEvent(new Event('input'));">
                #${this.escapeHtml(tag)} <small style="opacity: 0.7;">(${count})</small>
            </span>
        `).join('');
    }

    async loadCommunityStats() {
        try {
            const stats = await window.communityService.getCommunityStats();
            
            const totalPostsEl = document.getElementById('totalPosts');
            const totalMembersEl = document.getElementById('totalMembers');
            const postsTodayEl = document.getElementById('postsToday');
            
            if (totalPostsEl) totalPostsEl.textContent = stats.totalPosts.toLocaleString();
            if (totalMembersEl) totalMembersEl.textContent = stats.totalMembers.toLocaleString();
            if (postsTodayEl) postsTodayEl.textContent = stats.postsToday.toLocaleString();
            
        } catch (error) {
            console.error('❌ Error loading community stats:', error);
        }
    }

    async searchPosts(query) {
        if (!query || query.length < 2) {
            this.loadPosts(this.currentChannel);
            return;
        }

        console.log('🔍 Searching for:', query);
        
        // Simple client-side search (you can implement Algolia for better search)
        try {
            const result = await window.communityService.getPosts({
                channelId: this.currentChannel === 'all' ? null : this.currentChannel,
                limit: 100
            });

            const filteredPosts = result.posts.filter(post => {
                const searchStr = `${post.title} ${post.content} ${post.tags.join(' ')}`.toLowerCase();
                return searchStr.includes(query.toLowerCase());
            });

            this.postsGrid.innerHTML = '';
            
            if (filteredPosts.length === 0) {
                this.showEmptyState(`No posts found for "${this.escapeHtml(query)}"`);
            } else {
                this.renderPosts(filteredPosts);
            }

            if (this.loadMoreBtn) {
                this.loadMoreBtn.style.display = 'none';
            }

        } catch (error) {
            console.error('❌ Search error:', error);
        }
    }

    // ============================================
    // UTILITIES
    // ============================================

    showLoading() {
        if (this.loadingSpinner) {
            this.loadingSpinner.style.display = 'flex';
        }
    }

    hideLoading() {
        if (this.loadingSpinner) {
            this.loadingSpinner.style.display = 'none';
        }
    }

    showEmptyState(message = 'No posts yet in this channel') {
        this.postsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p style="font-size: 1.2rem; margin-top: 16px; margin-bottom: 24px;">${this.escapeHtml(message)}</p>
                <button class="create-post-btn" onclick="window.location.href='create-post.html'">
                    <i class="fas fa-plus"></i> Create First Post
                </button>
            </div>
        `;
    }

    showError(message) {
        this.postsGrid.innerHTML = `
            <div class="empty-state" style="color: #ef4444;">
                <i class="fas fa-exclamation-triangle"></i>
                <p style="font-size: 1.2rem; margin-top: 16px; margin-bottom: 24px;">${this.escapeHtml(message)}</p>
                <button class="filter-btn" onclick="window.communityHub.loadPosts('all')" style="padding: 14px 28px;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }

    createExcerpt(content, maxLength = 150) {
        const text = content.replace(/[#*`]/g, '').trim();
        if (text.length <= maxLength) return this.escapeHtml(text);
        return this.escapeHtml(text.substring(0, maxLength)) + '...';
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
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.communityHub = new CommunityHub();
    window.communityHub.initialize();
});