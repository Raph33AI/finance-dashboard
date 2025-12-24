// /* ============================================
//    ALPHAVAULT AI - COMMUNITY HUB
//    Logique Principale de la Page Hub
//    ============================================ */

// class CommunityHub {
//     constructor() {
//         this.postsGrid = document.getElementById('postsGrid');
//         this.loadingSpinner = document.getElementById('loadingSpinner');
//         this.loadMoreBtn = document.getElementById('loadMoreBtn');
//         this.searchInput = document.getElementById('searchInput');
        
//         this.currentChannel = 'all';
//         this.currentFilter = 'trending';
//         this.lastDoc = null;
//         this.isLoading = false;
//         this.searchTimeout = null;
//     }

//     async initialize() {
//         try {
//             console.log('🚀 Initializing Community Hub...');
            
//             // Initialize channels first
//             await window.channelManager.initialize();
            
//             // Load initial posts
//             await this.loadPosts('all');
            
//             // Load sidebar data
//             await this.loadSidebarData();
            
//             // Load community stats
//             await this.loadCommunityStats();
            
//             // Setup event listeners
//             this.setupEventListeners();
            
//             // ✅ NOUVEAU : Restaurer l'état du dropdown
//             this.restoreFiltersState();
            
//             console.log('✅ Community Hub initialized');
//         } catch (error) {
//             console.error('❌ Error initializing Community Hub:', error);
//         }
//     }

//     setupEventListeners() {
//         // Filter buttons
//         document.querySelectorAll('.filter-btn').forEach(btn => {
//             btn.addEventListener('click', (e) => {
//                 const filter = e.currentTarget.dataset.filter;
//                 if (filter) {
//                     this.setFilter(filter);
//                 }
//             });
//         });

//         // Load more button
//         if (this.loadMoreBtn) {
//             this.loadMoreBtn.addEventListener('click', () => {
//                 this.loadMorePosts();
//             });
//         }

//         // Search input
//         if (this.searchInput) {
//             this.searchInput.addEventListener('input', (e) => {
//                 clearTimeout(this.searchTimeout);
//                 this.searchTimeout = setTimeout(() => {
//                     this.searchPosts(e.target.value);
//                 }, 500);
//             });
//         }
//     }

//     // ════════════════════════════════════════════════════════════════
//     // ✨ NOUVEAU : GESTION DU DROPDOWN DES FILTRES
//     // ════════════════════════════════════════════════════════════════

//     toggleFiltersSection() {
//         const content = document.getElementById('communityFiltersContent');
//         const header = document.querySelector('.community-filters-header');
        
//         if (!content || !header) {
//             console.error('❌ Community filters elements not found');
//             return;
//         }
        
//         const isCollapsed = content.classList.contains('collapsed');
        
//         if (isCollapsed) {
//             content.classList.remove('collapsed');
//             header.classList.remove('collapsed');
//             localStorage.setItem('communityFiltersExpanded', 'true');
//             console.log('🔽 Community filters expanded');
//         } else {
//             content.classList.add('collapsed');
//             header.classList.add('collapsed');
//             localStorage.setItem('communityFiltersExpanded', 'false');
//             console.log('🔼 Community filters collapsed');
//         }
//     }

//     restoreFiltersState() {
//         const isExpanded = localStorage.getItem('communityFiltersExpanded') !== 'false';
//         const content = document.getElementById('communityFiltersContent');
//         const header = document.querySelector('.community-filters-header');
        
//         if (!content || !header) {
//             console.warn('⚠ Community filters elements not found for state restoration');
//             return;
//         }
        
//         if (!isExpanded) {
//             content.classList.add('collapsed');
//             header.classList.add('collapsed');
//             console.log('📦 Community filters restored: COLLAPSED');
//         } else {
//             console.log('📦 Community filters restored: EXPANDED');
//         }
//     }

//     // ════════════════════════════════════════════════════════════════
//     // FILTRES ET CHARGEMENT
//     // ════════════════════════════════════════════════════════════════

//     setFilter(filter) {
//         this.currentFilter = filter;
        
//         // Update UI
//         document.querySelectorAll('.filter-btn').forEach(btn => {
//             btn.classList.toggle('active', btn.dataset.filter === filter);
//         });

//         // Reload posts
//         this.loadPosts(this.currentChannel);
        
//         console.log('🔍 Filter set to:', filter);
//     }

//     async loadPosts(channelId = 'all', append = false) {
//         if (this.isLoading) return;
        
//         try {
//             this.isLoading = true;
//             this.currentChannel = channelId;
            
//             if (!append) {
//                 this.showLoading();
//                 this.lastDoc = null;
//             }

//             // Gestion du filtre "Following"
//             if (this.currentFilter === 'following') {
//                 await this.loadFollowingPosts();
//                 return;
//             }

//             // Determine order
//             let orderBy = 'createdAt';
//             let orderDirection = 'desc';

//             if (this.currentFilter === 'trending') {
//                 orderBy = 'upvotes';
//             } else if (this.currentFilter === 'top') {
//                 orderBy = 'viewCount';
//             }

//             const result = await window.communityService.getPosts({
//                 channelId: channelId === 'all' ? null : channelId,
//                 limit: 10,
//                 orderBy,
//                 orderDirection,
//                 lastDoc: append ? this.lastDoc : null
//             });

//             if (!append) {
//                 this.postsGrid.innerHTML = '';
//             }

//             if (result.posts.length === 0 && !append) {
//                 this.showEmptyState();
//             } else {
//                 this.renderPosts(result.posts);
//                 this.lastDoc = result.lastDoc;
                
//                 if (this.loadMoreBtn) {
//                     this.loadMoreBtn.style.display = result.hasMore ? 'inline-flex' : 'none';
//                 }
//             }

//         } catch (error) {
//             console.error('❌ Error loading posts:', error);
//             this.showError('Failed to load posts. Please try again.');
//         } finally {
//             this.isLoading = false;
//             this.hideLoading();
//         }
//     }

//     async loadFollowingPosts() {
//         try {
//             const currentUser = firebase.auth().currentUser;
            
//             if (!currentUser) {
//                 this.showEmptyState('Please sign in to see posts from people you follow');
//                 return;
//             }

//             const posts = await window.followSystem.getFollowingPosts(20);

//             this.postsGrid.innerHTML = '';

//             if (posts.length === 0) {
//                 this.showEmptyState('No posts from people you follow. Start following users to see their posts here!');
//             } else {
//                 this.renderPosts(posts);
//             }

//             if (this.loadMoreBtn) {
//                 this.loadMoreBtn.style.display = 'none';
//             }

//             this.hideLoading();

//         } catch (error) {
//             console.error('❌ Error loading following posts:', error);
//             this.showError('Failed to load posts from people you follow');
//         }
//     }

//     async loadMorePosts() {
//         await this.loadPosts(this.currentChannel, true);
//     }

//     renderPosts(posts) {
//         const postsHTML = posts.map(post => this.createPostCard(post)).join('');
//         this.postsGrid.insertAdjacentHTML('beforeend', postsHTML);
        
//         // Add click handlers
//         this.postsGrid.querySelectorAll('.post-card').forEach(card => {
//             const postId = card.dataset.postId;
            
//             card.addEventListener('click', (e) => {
//                 if (e.target.closest('.post-stat')) return;
//                 window.location.href = `post.html?id=${postId}`;
//             });
            
//             const upvoteBtn = card.querySelector('.upvote-btn');
//             if (upvoteBtn) {
//                 upvoteBtn.addEventListener('click', async (e) => {
//                     e.stopPropagation();
//                     await this.handleUpvote(postId, upvoteBtn);
//                 });
//             }
//         });
//     }

//     createPostCard(post) {
//         const channel = window.channelManager.getChannel(post.channelId);
//         const channelIconFA = this.getChannelIconFA(post.channelId);
//         const channelName = channel ? channel.name : 'General';
        
//         const timeAgo = this.formatTimeAgo(post.createdAt);
//         const excerpt = this.createExcerpt(post.content, 150);
        
//         const tagsHTML = post.tags && post.tags.length > 0 ? `
//             <div class="post-tags">
//                 ${post.tags.slice(0, 5).map(tag => `
//                     <span class="post-tag">#${this.escapeHtml(tag)}</span>
//                 `).join('')}
//             </div>
//         ` : '';

//         const verifiedBadge = post.authorBadges?.includes('verified-analyst') ? 
//             '<i class="fas fa-check-circle" style="color: #10b981; margin-left: 6px; font-size: 0.9rem;"></i>' : '';

//         const currentUser = firebase.auth().currentUser;
//         const hasUpvoted = currentUser && post.upvotedBy?.includes(currentUser.uid);

//         const authorAvatar = post.authorPhoto || post.authorAvatar || 
//             `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName)}&background=667eea&color=fff&size=64`;

//         return `
//             <div class="post-card" data-post-id="${post.id}">
//                 <div class="post-header">
//                     <div class="post-author">
//                         <img 
//                             src="${authorAvatar}" 
//                             alt="${this.escapeHtml(post.authorName)}" 
//                             class="author-avatar"
//                             onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName)}&background=667eea&color=fff&size=64'"
//                         >
//                         <div class="author-info">
//                             <div class="author-name">
//                                 ${this.escapeHtml(post.authorName)}
//                                 ${verifiedBadge}
//                             </div>
//                             <div class="post-date">
//                                 <i class="fas fa-clock"></i> ${timeAgo}
//                             </div>
//                         </div>
//                     </div>
                    
//                     <div class="post-channel">
//                         <i class="fas ${channelIconFA}"></i>
//                         ${channelName}
//                     </div>
//                 </div>

//                 <div class="post-content">
//                     <h3 class="post-title">${this.escapeHtml(post.title)}</h3>
//                     <p class="post-excerpt">${excerpt}</p>
//                 </div>
                
//                 ${tagsHTML}

//                 <div class="post-footer">
//                     <div class="post-author"></div>
//                     <div class="post-stats">
//                         <div class="post-stat upvote-btn ${hasUpvoted ? 'upvoted' : ''}" style="cursor: pointer;">
//                             <i class="fas fa-arrow-up"></i>
//                             <span>${post.upvotes || 0}</span>
//                         </div>
//                         <div class="post-stat">
//                             <i class="fas fa-comment"></i>
//                             <span>${post.commentCount || 0}</span>
//                         </div>
//                         <div class="post-stat">
//                             <i class="fas fa-eye"></i>
//                             <span>${post.viewCount || 0}</span>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         `;
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

//     async handleUpvote(postId, buttonElement) {
//         try {
//             const currentUser = firebase.auth().currentUser;
//             if (!currentUser) {
//                 alert('Please sign in to upvote');
//                 return;
//             }

//             await window.communityService.upvotePost(postId);
            
//             const post = await window.communityService.getPost(postId);
//             const countSpan = buttonElement.querySelector('span');
//             if (countSpan) {
//                 countSpan.textContent = post.upvotes || 0;
//             }
            
//             const hasUpvoted = currentUser && post.upvotedBy?.includes(currentUser.uid);
            
//             if (hasUpvoted) {
//                 buttonElement.classList.add('upvoted');
//             } else {
//                 buttonElement.classList.remove('upvoted');
//             }
            
//         } catch (error) {
//             console.error('❌ Error upvoting post:', error);
//             alert('Failed to upvote post');
//         }
//     }

//     async loadSidebarData() {
//         try {
//             const featuredPosts = await window.communityService.getFeaturedPosts(3);
//             this.renderFeaturedPosts(featuredPosts);

//             const topContributors = await window.communityService.getTopContributors(5);
//             this.renderLeaderboard(topContributors);

//             const trendingTags = await window.communityService.getTrendingTags(10);
//             this.renderTrendingTags(trendingTags);

//         } catch (error) {
//             console.error('❌ Error loading sidebar data:', error);
//         }
//     }

//     renderFeaturedPosts(posts) {
//         const container = document.getElementById('featuredPosts');
//         if (!container) return;

//         if (posts.length === 0) {
//             container.innerHTML = `
//                 <div class="featured-posts-empty">
//                     <i class="fas fa-inbox"></i>
//                     <p>No featured posts yet</p>
//                 </div>
//             `;
//             return;
//         }

//         container.innerHTML = posts.map(post => {
//             const timeAgo = this.formatTimeAgo(post.createdAt);
            
//             return `
//                 <div class="featured-post" onclick="window.location.href='post.html?id=${post.id}'">
//                     <div class="featured-post-title">
//                         ${this.escapeHtml(post.title)}
//                     </div>
//                     <div class="featured-post-meta">
//                         <span><i class="fas fa-arrow-up"></i> ${post.upvotes || 0}</span>
//                         <span><i class="fas fa-comment"></i> ${post.commentCount || 0}</span>
//                         <span><i class="fas fa-clock"></i> ${timeAgo}</span>
//                     </div>
//                 </div>
//             `;
//         }).join('');
//     }

//     renderLeaderboard(users) {
//         const container = document.getElementById('leaderboardList');
//         if (!container) return;

//         if (users.length === 0) {
//             container.innerHTML = `
//                 <div style="text-align: center; padding: 20px; color: var(--text-secondary); font-size: 0.9rem;">
//                     No contributors yet
//                 </div>
//             `;
//             return;
//         }

//         container.innerHTML = users.map((user, index) => {
//             const rankClass = index === 0 ? 'top-1' : index === 1 ? 'top-2' : index === 2 ? 'top-3' : '';
//             const avatar = user.photoURL || 
//                 `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=667eea&color=fff&size=64`;
            
//             return `
//                 <div class="leaderboard-item" 
//                     onclick="window.location.href='public-profile.html?uid=${user.uid}'" 
//                     style="cursor: pointer; transition: all 0.3s ease;">
//                     <div class="leaderboard-rank ${rankClass}">${index + 1}</div>
//                     <img 
//                         src="${avatar}" 
//                         alt="${this.escapeHtml(user.displayName || user.email)}" 
//                         class="leaderboard-avatar"
//                         onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=667eea&color=fff&size=64'"
//                     >
//                     <div class="leaderboard-info">
//                         <div class="leaderboard-name">
//                             ${this.escapeHtml(user.displayName || user.email.split('@')[0])}
//                         </div>
//                         <div class="leaderboard-points">
//                             ${user.reputation || 0} points
//                         </div>
//                     </div>
//                 </div>
//             `;
//         }).join('');
//     }

//     renderTrendingTags(tags) {
//         const container = document.getElementById('trendingTags');
//         if (!container) return;

//         if (tags.length === 0) {
//             container.innerHTML = `
//                 <span class="post-tag" style="opacity: 0.5;">No trending tags</span>
//             `;
//             return;
//         }

//         container.innerHTML = tags.map(({ tag, count }) => `
//             <span class="post-tag" style="cursor: pointer;" onclick="document.getElementById('searchInput').value='#${tag}'; document.getElementById('searchInput').dispatchEvent(new Event('input'));">
//                 #${this.escapeHtml(tag)} <small style="opacity: 0.7;">(${count})</small>
//             </span>
//         `).join('');
//     }

//     async loadCommunityStats() {
//         try {
//             const stats = await window.communityService.getCommunityStats();
            
//             const totalPostsEl = document.getElementById('totalPosts');
//             const totalMembersEl = document.getElementById('totalMembers');
//             const postsTodayEl = document.getElementById('postsToday');
            
//             if (totalPostsEl) totalPostsEl.textContent = stats.totalPosts.toLocaleString();
//             if (totalMembersEl) totalMembersEl.textContent = stats.totalMembers.toLocaleString();
//             if (postsTodayEl) postsTodayEl.textContent = stats.postsToday.toLocaleString();
            
//         } catch (error) {
//             console.error('❌ Error loading community stats:', error);
//         }
//     }

//     async searchPosts(query) {
//         if (!query || query.length < 2) {
//             this.loadPosts(this.currentChannel);
//             return;
//         }

//         console.log('🔍 Searching for:', query);
        
//         try {
//             const result = await window.communityService.getPosts({
//                 channelId: this.currentChannel === 'all' ? null : this.currentChannel,
//                 limit: 100
//             });

//             const filteredPosts = result.posts.filter(post => {
//                 const searchStr = `${post.title} ${post.content} ${post.tags.join(' ')}`.toLowerCase();
//                 return searchStr.includes(query.toLowerCase());
//             });

//             this.postsGrid.innerHTML = '';
            
//             if (filteredPosts.length === 0) {
//                 this.showEmptyState(`No posts found for "${this.escapeHtml(query)}"`);
//             } else {
//                 this.renderPosts(filteredPosts);
//             }

//             if (this.loadMoreBtn) {
//                 this.loadMoreBtn.style.display = 'none';
//             }

//         } catch (error) {
//             console.error('❌ Search error:', error);
//         }
//     }

//     // ============================================
//     // UTILITIES
//     // ============================================

//     showLoading() {
//         if (this.loadingSpinner) {
//             this.loadingSpinner.style.display = 'flex';
//         }
//     }

//     hideLoading() {
//         if (this.loadingSpinner) {
//             this.loadingSpinner.style.display = 'none';
//         }
//     }

//     showEmptyState(message = 'No posts yet in this channel') {
//         this.postsGrid.innerHTML = `
//             <div class="empty-state">
//                 <i class="fas fa-inbox"></i>
//                 <p style="font-size: 1.2rem; margin-top: 16px; margin-bottom: 24px;">${this.escapeHtml(message)}</p>
//                 <button class="create-post-btn" onclick="window.location.href='create-post.html'">
//                     <i class="fas fa-plus"></i> Create First Post
//                 </button>
//             </div>
//         `;
//     }

//     showError(message) {
//         this.postsGrid.innerHTML = `
//             <div class="empty-state" style="color: #ef4444;">
//                 <i class="fas fa-exclamation-triangle"></i>
//                 <p style="font-size: 1.2rem; margin-top: 16px; margin-bottom: 24px;">${this.escapeHtml(message)}</p>
//                 <button class="filter-btn" onclick="window.communityHub.loadPosts('all')" style="padding: 14px 28px;">
//                     <i class="fas fa-redo"></i> Retry
//                 </button>
//             </div>
//         `;
//     }

//     createExcerpt(content, maxLength = 150) {
//         const text = content.replace(/[#*`]/g, '').trim();
//         if (text.length <= maxLength) return this.escapeHtml(text);
//         return this.escapeHtml(text.substring(0, maxLength)) + '...';
//     }

//     formatTimeAgo(date) {
//         if (!date) return 'Just now';
        
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
// }

// // Initialize on DOM load
// document.addEventListener('DOMContentLoaded', () => {
//     window.communityHub = new CommunityHub();
//     window.communityHub.initialize();
// });

/* ============================================
   ALPHAVAULT AI - COMMUNITY HUB
   Page principale de la communauté
   ============================================ */

class CommunityHub {
    constructor() {
        this.currentChannel = 'all';
        this.currentSort = 'createdAt';
        this.currentTag = null;
        this.posts = [];
        this.channels = [];
    }

    async initialize() {
        try {
            console.log('🏠 Initializing Community Hub...');

            // Attendre l'authentification
            await this.waitForAuth();

            // Charger les channels
            await this.loadChannels();

            // Charger les posts
            await this.loadPosts();

            // Charger la sidebar
            await this.loadSidebarData();

            // Charger les stats
            await this.loadCommunityStats();

            // Setup event listeners
            this.setupEventListeners();

            console.log('✅ Community Hub initialized');

        } catch (error) {
            console.error('❌ Error initializing Community Hub:', error);
            this.showError('Failed to load community: ' + error.message);
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
            this.renderChannelFilters();
            console.log('✅ Channels loaded:', this.channels.length);
        } catch (error) {
            console.error('❌ Error loading channels:', error);
            // Continuer même si les channels ne chargent pas
        }
    }

    async loadPosts() {
        try {
            const postsContainer = document.getElementById('postsContainer');
            if (!postsContainer) {
                console.error('❌ Posts container not found');
                return;
            }

            postsContainer.innerHTML = `
                <div style="text-align: center; padding: 60px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #3B82F6;"></i>
                    <p style="margin-top: 16px; color: var(--text-secondary);">Loading posts...</p>
                </div>
            `;

            const options = {
                sortBy: this.currentSort,
                sortOrder: 'desc',
                limit: 50
            };

            if (this.currentChannel !== 'all') {
                options.channelId = this.currentChannel;
            }

            if (this.currentTag) {
                options.tag = this.currentTag;
            }

            this.posts = await window.communityService.getPosts(options);

            // ✅ VÉRIFICATION CRITIQUE
            if (!this.posts) {
                this.posts = [];
            }

            console.log('✅ Posts loaded:', this.posts.length);

            this.renderPosts();

        } catch (error) {
            console.error('❌ Error loading posts:', error);
            const postsContainer = document.getElementById('postsContainer');
            if (postsContainer) {
                postsContainer.innerHTML = `
                    <div style="text-align: center; padding: 60px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #EF4444;"></i>
                        <p style="margin-top: 16px; color: var(--text-secondary);">Failed to load posts</p>
                    </div>
                `;
            }
        }
    }

    renderChannelFilters() {
        const filtersContainer = document.getElementById('channelFilters');
        if (!filtersContainer) return;

        const allButton = `
            <button class="filter-btn ${this.currentChannel === 'all' ? 'active' : ''}" data-channel="all">
                <i class="fas fa-border-all"></i> All Channels
            </button>
        `;

        const channelButtons = this.channels.map(channel => `
            <button class="filter-btn ${this.currentChannel === channel.id ? 'active' : ''}" data-channel="${channel.id}">
                <span>${channel.icon}</span> ${channel.name}
            </button>
        `).join('');

        filtersContainer.innerHTML = allButton + channelButtons;
    }

    renderPosts() {
        const postsContainer = document.getElementById('postsContainer');
        if (!postsContainer) return;

        if (this.posts.length === 0) {
            postsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox" style="font-size: 4rem; opacity: 0.3; margin-bottom: 16px;"></i>
                    <h3>No posts yet</h3>
                    <p>Be the first to share your insights!</p>
                    <a href="create-post.html" class="filter-btn" style="margin-top: 16px; display: inline-flex;">
                        <i class="fas fa-plus"></i> Create Post
                    </a>
                </div>
            `;
            return;
        }

        postsContainer.innerHTML = this.posts.map(post => this.renderPostCard(post)).join('');
    }

    renderPostCard(post) {
        const channel = this.channels.find(c => c.id === post.channelId);
        const channelIcon = channel ? channel.icon : '📝';
        const channelName = channel ? channel.name : 'General';

        const tagsHTML = post.tags && post.tags.length > 0 
            ? post.tags.slice(0, 3).map(tag => `<span class="post-tag">#${tag}</span>`).join('')
            : '';

        const imagePreview = post.images && post.images.length > 0
            ? `<div class="post-image-preview">
                   <img src="${post.images[0]}" alt="Post preview" loading="lazy">
                   ${post.images.length > 1 ? `<div class="image-count">+${post.images.length - 1}</div>` : ''}
               </div>`
            : '';

        return `
            <article class="post-card" onclick="window.location.href='post.html?id=${post.id}'">
                <div class="post-card-header">
                    <div class="post-author">
                        <img src="${post.authorPhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(post.authorName) + '&background=3B82F6&color=fff'}" alt="${post.authorName}" class="author-avatar-small">
                        <div>
                            <div class="author-name-small">${post.authorName}</div>
                            <div class="post-meta-small">
                                <span>${channelIcon} ${channelName}</span>
                                <span>•</span>
                                <span>${this.formatDate(post.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <h2 class="post-card-title">${this.escapeHtml(post.title)}</h2>

                ${post.content ? `<p class="post-card-excerpt">${this.truncate(this.escapeHtml(post.content), 200)}</p>` : ''}

                ${imagePreview}

                ${tagsHTML ? `<div class="post-card-tags">${tagsHTML}</div>` : ''}

                <div class="post-card-footer">
                    <div class="post-stats-small">
                        <span><i class="fas fa-eye"></i> ${post.views || 0}</span>
                        <span><i class="fas fa-heart"></i> ${post.likes?.length || 0}</span>
                        <span><i class="fas fa-comments"></i> ${post.commentsCount || 0}</span>
                    </div>
                    <button class="btn-read-more">
                        Read More <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </article>
        `;
    }

    async loadSidebarData() {
        try {
            // Charger les posts populaires
            const featuredPosts = await window.communityService.getFeaturedPosts(5);
            this.renderFeaturedPosts(featuredPosts);

            // Charger les tags populaires
            const popularTags = await window.communityService.getPopularTags(10);
            this.renderPopularTags(popularTags);

        } catch (error) {
            console.error('❌ Error loading sidebar data:', error);
        }
    }

    renderFeaturedPosts(posts) {
        const container = document.getElementById('featuredPosts');
        if (!container || !posts) return;

        if (posts.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No posts yet</p>';
            return;
        }

        container.innerHTML = posts.map(post => `
            <div class="sidebar-post-item" onclick="window.location.href='post.html?id=${post.id}'">
                <h4>${this.truncate(this.escapeHtml(post.title), 60)}</h4>
                <div class="sidebar-post-meta">
                    <span><i class="fas fa-eye"></i> ${post.views || 0}</span>
                    <span><i class="fas fa-heart"></i> ${post.likes?.length || 0}</span>
                </div>
            </div>
        `).join('');
    }

    renderPopularTags(tags) {
        const container = document.getElementById('popularTags');
        if (!container || !tags) return;

        if (tags.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No tags yet</p>';
            return;
        }

        container.innerHTML = tags.map(({ tag, count }) => `
            <button class="tag-cloud-item" onclick="window.communityHub.filterByTag('${tag}')">
                #${tag} <span class="tag-count">${count}</span>
            </button>
        `).join('');
    }

    async loadCommunityStats() {
        try {
            const stats = await window.communityService.getCommunityStats();
            this.renderCommunityStats(stats);
        } catch (error) {
            console.error('❌ Error loading community stats:', error);
        }
    }

    renderCommunityStats(stats) {
        const container = document.getElementById('communityStats');
        if (!container || !stats) return;

        container.innerHTML = `
            <div class="stat-item">
                <i class="fas fa-file-alt"></i>
                <div>
                    <div class="stat-value">${stats.totalPosts || 0}</div>
                    <div class="stat-label">Posts</div>
                </div>
            </div>
            <div class="stat-item">
                <i class="fas fa-users"></i>
                <div>
                    <div class="stat-value">${stats.totalMembers || 0}</div>
                    <div class="stat-label">Members</div>
                </div>
            </div>
            <div class="stat-item">
                <i class="fas fa-comments"></i>
                <div>
                    <div class="stat-value">${stats.totalComments || 0}</div>
                    <div class="stat-label">Comments</div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Channel filters
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-channel]')) {
                const channel = e.target.closest('[data-channel]').dataset.channel;
                this.filterByChannel(channel);
            }
        });

        // Sort filters
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-sort]')) {
                const sort = e.target.closest('[data-sort]').dataset.sort;
                this.sortBy(sort);
            }
        });
    }

    filterByChannel(channelId) {
        this.currentChannel = channelId;
        this.currentTag = null;
        this.renderChannelFilters();
        this.loadPosts();
    }

    filterByTag(tag) {
        this.currentTag = tag;
        this.currentChannel = 'all';
        this.renderChannelFilters();
        this.loadPosts();
    }

    sortBy(sortBy) {
        this.currentSort = sortBy;
        this.loadPosts();
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
            day: 'numeric'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    truncate(text, length) {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }

    showError(message) {
        const postsContainer = document.getElementById('postsContainer');
        if (postsContainer) {
            postsContainer.innerHTML = `
                <div style="text-align: center; padding: 60px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #EF4444;"></i>
                    <p style="margin-top: 16px; color: var(--text-secondary);">${message}</p>
                </div>
            `;
        }
    }
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    window.communityHub = new CommunityHub();
    window.communityHub.initialize();
});