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
                limit: 20,
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
                
                // Show/hide load more button
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
                if (e.target.closest('.stat-btn')) return;
                
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
        const channelGradient = channel ? channel.gradient : 'linear-gradient(135deg, #667eea, #764ba2)';
        const channelIcon = channel ? channel.icon : '📄';
        const channelName = channel ? channel.name : 'General';
        
        const timeAgo = this.formatTimeAgo(post.createdAt);
        const excerpt = this.createExcerpt(post.content, 200);
        
        const imagesHTML = post.images && post.images.length > 0 ? `
            <div class="post-images">
                ${post.images.slice(0, 3).map(img => `
                    <img src="${img}" alt="Post image" class="post-image">
                `).join('')}
            </div>
        ` : '';

        const tagsHTML = post.tags && post.tags.length > 0 ? `
            <div class="post-tags">
                ${post.tags.slice(0, 5).map(tag => `
                    <span class="tag">#${tag}</span>
                `).join('')}
            </div>
        ` : '';

        const verifiedBadge = post.authorBadges?.includes('verified-analyst') ? 
            '<i class="fas fa-badge-check verified-badge"></i>' : '';

        const currentUser = firebase.auth().currentUser;
        const hasUpvoted = currentUser && post.upvotedBy?.includes(currentUser.uid);

        return `
            <div class="post-card" data-post-id="${post.id}" style="--channel-gradient: ${channelGradient};">
                <div class="post-header">
                    <div class="post-author">
                        <div class="author-avatar" style="background: ${channelGradient};">
                            ${post.authorName.charAt(0).toUpperCase()}
                        </div>
                        <div class="author-info">
                            <div class="author-name">
                                ${post.authorName}
                                ${verifiedBadge}
                            </div>
                            <div class="post-meta">
                                <i class="fas fa-clock"></i> ${timeAgo}
                            </div>
                        </div>
                    </div>
                    <div class="channel-badge" style="background: ${channelGradient};">
                        <span>${channelIcon}</span>
                        <span>${channelName}</span>
                    </div>
                </div>

                <h3 class="post-title">${this.escapeHtml(post.title)}</h3>
                
                <p class="post-excerpt">${excerpt}</p>
                
                ${tagsHTML}
                
                ${imagesHTML}

                <div class="post-footer">
                    <div class="post-stats">
                        <button class="stat-btn upvote-btn ${hasUpvoted ? 'upvoted' : ''}">
                            <i class="fas fa-arrow-up"></i>
                            <span>${post.upvotes || 0}</span>
                        </button>
                        <button class="stat-btn">
                            <i class="fas fa-comment"></i>
                            <span>${post.commentCount || 0}</span>
                        </button>
                        <button class="stat-btn">
                            <i class="fas fa-eye"></i>
                            <span>${post.viewCount || 0}</span>
                        </button>
                    </div>
                    <button class="read-more-btn">
                        Read More <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    async handleUpvote(postId, buttonElement) {
        try {
            await window.communityService.upvotePost(postId);
            
            // Update UI
            const post = await window.communityService.getPost(postId);
            const countSpan = buttonElement.querySelector('span');
            if (countSpan) {
                countSpan.textContent = post.upvotes || 0;
            }
            
            const currentUser = firebase.auth().currentUser;
            const hasUpvoted = currentUser && post.upvotedBy?.includes(currentUser.uid);
            buttonElement.classList.toggle('upvoted', hasUpvoted);
            
        } catch (error) {
            console.error('❌ Error upvoting post:', error);
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
            container.innerHTML = '<p style="color: rgba(255,255,255,0.5); font-size: 0.9rem;">No featured posts yet</p>';
            return;
        }

        container.innerHTML = posts.map(post => `
            <div style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); cursor: pointer;" onclick="window.location.href='post.html?id=${post.id}'">
                <div style="font-weight: 700; color: white; font-size: 0.95rem; margin-bottom: 6px;">
                    ${this.escapeHtml(post.title)}
                </div>
                <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5);">
                    <i class="fas fa-arrow-up"></i> ${post.upvotes || 0} • 
                    <i class="fas fa-comment"></i> ${post.commentCount || 0}
                </div>
            </div>
        `).join('');
    }

    renderLeaderboard(users) {
        const container = document.getElementById('leaderboardList');
        if (!container) return;

        if (users.length === 0) {
            container.innerHTML = '<p style="color: rgba(255,255,255,0.5); font-size: 0.9rem;">No contributors yet</p>';
            return;
        }

        container.innerHTML = users.map((user, index) => {
            const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
            
            return `
                <div class="leaderboard-item">
                    <div class="rank-badge ${rankClass}">${index + 1}</div>
                    <div class="user-mini-avatar" style="background: linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16)}, #${Math.floor(Math.random()*16777215).toString(16)});">
                        ${(user.displayName || user.email).charAt(0).toUpperCase()}
                    </div>
                    <div class="user-mini-info">
                        <div class="user-mini-name">${user.displayName || user.email.split('@')[0]}</div>
                        <div class="user-mini-score">${user.reputation || 0} points</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderTrendingTags(tags) {
        const container = document.getElementById('trendingTags');
        if (!container) return;

        if (tags.length === 0) {
            container.innerHTML = '<span class="tag">No trending tags</span>';
            return;
        }

        container.innerHTML = tags.map(({ tag, count }) => `
            <span class="tag" style="cursor: pointer;" onclick="document.getElementById('searchInput').value='#${tag}'; document.getElementById('searchInput').dispatchEvent(new Event('input'));">
                #${tag} <small>(${count})</small>
            </span>
        `).join('');
    }

    async loadCommunityStats() {
        try {
            const stats = await window.communityService.getCommunityStats();
            
            document.getElementById('totalPosts').textContent = stats.totalPosts.toLocaleString();
            document.getElementById('totalMembers').textContent = stats.totalMembers.toLocaleString();
            document.getElementById('postsToday').textContent = stats.postsToday.toLocaleString();
            
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
                this.showEmptyState(`No posts found for "${query}"`);
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
            <div style="text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.6);">
                <i class="fas fa-inbox" style="font-size: 4rem; margin-bottom: 20px; opacity: 0.5;"></i>
                <h3 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 12px; color: white;">${message}</h3>
                <p style="font-size: 1rem; margin-bottom: 24px;">Be the first to share your insights!</p>
                <button class="create-post-btn" onclick="window.location.href='create-post.html'">
                    <i class="fas fa-plus"></i> Create First Post
                </button>
            </div>
        `;
    }

    showError(message) {
        this.postsGrid.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #EF4444;">
                <i class="fas fa-exclamation-triangle" style="font-size: 4rem; margin-bottom: 20px;"></i>
                <h3 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 12px;">${message}</h3>
                <button class="filter-btn" onclick="window.communityHub.loadPosts('all')" style="margin-top: 20px;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }

    createExcerpt(content, maxLength = 200) {
        const text = content.replace(/[#*`]/g, '').trim();
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
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
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.communityHub = new CommunityHub();
    window.communityHub.initialize();
});