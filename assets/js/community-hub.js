/* ============================================
   ALPHAVAULT AI - COMMUNITY HUB
   Compatible avec l'HTML existant
   ============================================ */

class CommunityHub {
    constructor() {
        this.currentChannel = 'all';
        this.currentFilter = 'trending';
        this.currentTag = null;
        this.posts = [];
        this.channels = [];
        this.currentUser = null;
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

            // Charger les stats
            await this.loadCommunityStats();

            // Charger la sidebar
            await this.loadSidebarData();

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
            this.renderChannels();
            console.log('✅ Channels loaded:', this.channels.length);
        } catch (error) {
            console.error('❌ Error loading channels:', error);
        }
    }

    renderChannels() {
        const channelsScroll = document.getElementById('channelsScroll');
        if (!channelsScroll) return;

        const allChannel = `
            <button class="channel-card ${this.currentChannel === 'all' ? 'active' : ''}" data-channel="all">
                <div class="channel-icon">🌐</div>
                <div class="channel-info">
                    <div class="channel-name">All Channels</div>
                </div>
            </button>
        `;

        const channelsHTML = this.channels.map(channel => `
            <button class="channel-card ${this.currentChannel === channel.id ? 'active' : ''}" data-channel="${channel.id}">
                <div class="channel-icon">${channel.icon}</div>
                <div class="channel-info">
                    <div class="channel-name">${channel.name}</div>
                    <div class="channel-count">${channel.postCount || 0} posts</div>
                </div>
            </button>
        `).join('');

        channelsScroll.innerHTML = allChannel + channelsHTML;
    }

    async loadPosts() {
        try {
            const postsGrid = document.getElementById('postsGrid');
            if (!postsGrid) {
                console.error('❌ Posts grid not found');
                return;
            }

            // Afficher le loading
            postsGrid.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #3B82F6;"></i>
                    <p style="margin-top: 16px; color: var(--text-secondary);">Loading posts...</p>
                </div>
            `;

            // ✅ CORRECTION : Construire la requête Firestore directement
            let query = firebase.firestore().collection('posts');

            // ✅ Filtre par channel (AVANT le tri pour éviter les erreurs d'index)
            if (this.currentChannel !== 'all') {
                console.log('🔍 Filtering by channel:', this.currentChannel);
                query = query.where('channelId', '==', this.currentChannel);
            }

            // ✅ Filtre par tag
            if (this.currentTag) {
                console.log('🏷 Filtering by tag:', this.currentTag);
                query = query.where('tags', 'array-contains', this.currentTag);
            }

            // ✅ Tri selon le filtre actif
            if (this.currentFilter === 'trending') {
                query = query.orderBy('views', 'desc');
            } else if (this.currentFilter === 'latest') {
                query = query.orderBy('createdAt', 'desc');
            } else if (this.currentFilter === 'top') {
                // ⚠ NOTE : Firestore ne peut pas trier par array.length
                // Solution : ajouter un champ "likesCount" dans vos posts
                // OU trier côté client après récupération
                query = query.orderBy('createdAt', 'desc'); // Fallback sur date
            }

            query = query.limit(50);

            console.log('📡 Executing Firestore query...');
            const snapshot = await query.get();

            this.posts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // ✅ Si filtre "top", trier côté client par nombre de likes
            if (this.currentFilter === 'top') {
                this.posts.sort((a, b) => {
                    const likesA = (a.likes && Array.isArray(a.likes)) ? a.likes.length : 0;
                    const likesB = (b.likes && Array.isArray(b.likes)) ? b.likes.length : 0;
                    return likesB - likesA;
                });
            }

            console.log(`✅ Posts loaded: ${this.posts.length}`);
            console.log('📊 Posts data:', this.posts.map(p => ({ id: p.id, title: p.title, channelId: p.channelId })));

            this.renderPosts();

        } catch (error) {
            console.error('❌ Error loading posts:', error);
            console.error('❌ Error details:', {
                code: error.code,
                message: error.message,
                currentChannel: this.currentChannel,
                currentFilter: this.currentFilter,
                currentTag: this.currentTag
            });

            const postsGrid = document.getElementById('postsGrid');
            if (postsGrid) {
                postsGrid.innerHTML = `
                    <div style="text-align: center; padding: 60px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #EF4444;"></i>
                        <p style="margin-top: 16px; color: var(--text-secondary);">Failed to load posts</p>
                        <p style="margin-top: 8px; color: var(--text-secondary); font-size: 0.9rem;">${error.message}</p>
                        <button class="filter-btn" onclick="location.reload()" style="margin-top: 16px;">
                            <i class="fas fa-redo"></i> Retry
                        </button>
                    </div>
                `;
            }
        }
    }

    renderPosts() {
        const postsGrid = document.getElementById('postsGrid');
        if (!postsGrid) return;

        if (this.posts.length === 0) {
            postsGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 80px 20px;">
                    <i class="fas fa-inbox" style="font-size: 4rem; opacity: 0.3; margin-bottom: 24px; color: var(--text-secondary);"></i>
                    <h3 style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-bottom: 12px;">No posts yet</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 24px;">Be the first to share your insights with the community!</p>
                    <button class="create-post-btn" onclick="window.location.href='create-post.html'">
                        <i class="fas fa-plus"></i> Create First Post
                    </button>
                </div>
            `;
            return;
        }

        postsGrid.innerHTML = this.posts.map(post => this.renderPostCard(post)).join('');
    }

    renderPostCard(post) {
        const channel = this.channels.find(c => c.id === post.channelId);
        const channelIcon = channel ? channel.icon : '📝';
        const channelName = channel ? channel.name : 'General';

        const tagsHTML = post.tags && post.tags.length > 0 
            ? `<div class="post-card-tags">
                   ${post.tags.slice(0, 3).map(tag => `<span class="post-tag">#${tag}</span>`).join('')}
               </div>`
            : '';

        const imagePreview = post.images && post.images.length > 0
            ? `<div class="post-image-preview" style="width: 100%; height: 200px; border-radius: 12px; overflow: hidden; margin: 16px 0;">
                   <img src="${post.images[0]}" alt="Post preview" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">
                   ${post.images.length > 1 ? `<div class="image-count" style="position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,0.7); color: white; padding: 6px 12px; border-radius: 8px; font-weight: 700;">+${post.images.length - 1}</div>` : ''}
               </div>`
            : '';

        const excerpt = post.content ? this.stripMarkdown(post.content).substring(0, 150) + '...' : '';

        return `
            <article class="post-card" onclick="window.location.href='post.html?id=${post.id}'" style="cursor: pointer; background: var(--card-background); border-radius: 16px; padding: 24px; transition: all 0.3s ease; border: 2px solid var(--glass-border);">
                <div class="post-card-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                    <div class="post-author" style="display: flex; align-items: center; gap: 12px;">
                        <img src="${post.authorPhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(post.authorName) + '&background=3B82F6&color=fff'}" 
                             alt="${this.escapeHtml(post.authorName)}" 
                             style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                        <div>
                            <div style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem;">${this.escapeHtml(post.authorName)}</div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary); display: flex; align-items: center; gap: 8px;">
                                <span>${channelIcon} ${channelName}</span>
                                <span>•</span>
                                <span>${this.formatDate(post.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--text-primary); margin-bottom: 12px; line-height: 1.3;">${this.escapeHtml(post.title)}</h2>

                ${excerpt ? `<p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; margin-bottom: 16px;">${this.escapeHtml(excerpt)}</p>` : ''}

                ${imagePreview}

                ${tagsHTML}

                <div class="post-card-footer" style="display: flex; align-items: center; justify-content: space-between; padding-top: 16px; border-top: 2px solid var(--glass-border); margin-top: 16px;">
                    <div style="display: flex; gap: 16px; font-size: 0.9rem; color: var(--text-secondary);">
                        <span style="display: flex; align-items: center; gap: 6px;">
                            <i class="fas fa-eye"></i> ${post.views || 0}
                        </span>
                        <span style="display: flex; align-items: center; gap: 6px;">
                            <i class="fas fa-heart"></i> ${post.likes?.length || 0}
                        </span>
                        <span style="display: flex; align-items: center; gap: 6px;">
                            <i class="fas fa-comments"></i> ${post.commentsCount || 0}
                        </span>
                    </div>
                    <button class="btn-read-more" style="padding: 8px 16px; border-radius: 8px; background: var(--primary-gradient); color: white; border: none; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        Read More <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </article>
        `;
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
        // Total Posts
        const totalPostsEl = document.getElementById('totalPosts');
        if (totalPostsEl) {
            totalPostsEl.textContent = stats.totalPosts || 0;
        }

        // Total Members
        const totalMembersEl = document.getElementById('totalMembers');
        if (totalMembersEl) {
            totalMembersEl.textContent = stats.totalMembers || 0;
        }

        // Posts Today
        const postsTodayEl = document.getElementById('postsToday');
        if (postsTodayEl) {
            postsTodayEl.textContent = stats.activePosts || 0;
        }
    }

    async loadSidebarData() {
        try {
            // Featured Posts
            const featuredPosts = await window.communityService.getFeaturedPosts(5);
            this.renderFeaturedPosts(featuredPosts);

            // ✅ AJOUT : Charger le Leaderboard
            await this.loadLeaderboard();

            // Trending Tags
            const popularTags = await window.communityService.getPopularTags(10);
            this.renderTrendingTags(popularTags);

        } catch (error) {
            console.error('❌ Error loading sidebar data:', error);
        }
    }

    async loadLeaderboard() {
        try {
            const container = document.getElementById('leaderboardList');
            if (!container) return;

            // Loading state
            container.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 1.5rem; color: #3B82F6;"></i>
                </div>
            `;

            // ✅ Récupérer les top 5 utilisateurs triés par points
            const topUsers = await window.communityService.getTopContributors(5);

            if (!topUsers || topUsers.length === 0) {
                container.innerHTML = `
                    <div class="leaderboard-empty" style="text-align: center; padding: 20px; color: var(--text-secondary);">
                        <i class="fas fa-trophy" style="font-size: 2rem; opacity: 0.3; margin-bottom: 12px;"></i>
                        <p>No contributors yet</p>
                    </div>
                `;
                return;
            }

            this.renderLeaderboard(topUsers);

        } catch (error) {
            console.error('❌ Error loading leaderboard:', error);
            const container = document.getElementById('leaderboardList');
            if (container) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Failed to load leaderboard</p>
                    </div>
                `;
            }
        }
    }

    renderLeaderboard(users) {
        const container = document.getElementById('leaderboardList');
        if (!container) return;

        const medals = ['🥇', '🥈', '🥉', '4', '5'];

        container.innerHTML = users.map((user, index) => `
            <div class="leaderboard-item" 
                onclick="window.location.href='public-profile.html?id=${user.id}'" 
                style="display: flex; align-items: center; gap: 12px; padding: 16px; border-radius: 12px; margin-bottom: 12px; cursor: pointer; transition: all 0.3s ease; border: 2px solid var(--glass-border); background: ${index === 0 ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 193, 7, 0.05))' : 'var(--card-background)'};">
                <div class="leaderboard-rank" style="font-size: 1.5rem; min-width: 32px; text-align: center;">
                    ${medals[index]}
                </div>
                <img 
                    src="${user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || 'User') + '&background=3B82F6&color=fff'}" 
                    alt="${this.escapeHtml(user.displayName || 'User')}" 
                    style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid ${index === 0 ? '#FFD700' : 'var(--glass-border)'};"
                >
                <div style="flex: 1;">
                    <div style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem;">
                        ${this.escapeHtml(user.displayName || 'Anonymous')}
                    </div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-fire" style="color: #F59E0B;"></i> ${user.points || 0} points
                    </div>
                </div>
                <div style="text-align: right; font-size: 0.85rem; color: var(--text-secondary);">
                    <div><i class="fas fa-file-alt"></i> ${user.postsCount || 0}</div>
                </div>
            </div>
        `).join('');
    }

    renderFeaturedPosts(posts) {
        const container = document.getElementById('featuredPosts');
        if (!container) return;

        if (!posts || posts.length === 0) {
            container.innerHTML = `
                <div class="featured-posts-empty" style="text-align: center; padding: 20px; color: var(--text-secondary);">
                    <i class="fas fa-inbox" style="font-size: 2rem; opacity: 0.3; margin-bottom: 12px;"></i>
                    <p>No featured posts yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = posts.map(post => `
            <div class="featured-post-item" onclick="window.location.href='post.html?id=${post.id}'" 
                 style="padding: 16px; border-radius: 12px; margin-bottom: 12px; cursor: pointer; transition: all 0.3s ease; border: 2px solid var(--glass-border);">
                <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; line-height: 1.4;">
                    ${this.truncate(this.escapeHtml(post.title), 60)}
                </h4>
                <div style="display: flex; gap: 12px; font-size: 0.85rem; color: var(--text-secondary);">
                    <span><i class="fas fa-eye"></i> ${post.views || 0}</span>
                    <span><i class="fas fa-heart"></i> ${post.likes?.length || 0}</span>
                </div>
            </div>
        `).join('');
    }

    renderTrendingTags(tags) {
        const container = document.getElementById('trendingTags');
        if (!container) return;

        if (!tags || tags.length === 0) {
            container.innerHTML = `<p style="text-align: center; color: var(--text-secondary);">No tags yet</p>`;
            return;
        }

        container.innerHTML = tags.map(({ tag, count }) => `
            <button class="post-tag" onclick="window.communityHub.filterByTag('${tag}')" 
                    style="cursor: pointer; transition: all 0.3s ease;">
                #${tag} <span style="opacity: 0.7;">(${count})</span>
            </button>
        `).join('');
    }

    setupEventListeners() {
        // Channel filters
        document.addEventListener('click', (e) => {
            const channelBtn = e.target.closest('[data-channel]');
            if (channelBtn) {
                const channel = channelBtn.dataset.channel;
                this.filterByChannel(channel);
            }
        });

        // Filter buttons (trending, latest, top)
        document.addEventListener('click', (e) => {
            const filterBtn = e.target.closest('[data-filter]');
            if (filterBtn) {
                const filter = filterBtn.dataset.filter;
                this.filterBy(filter);
            }
        });
    }

    filterByChannel(channelId) {
        this.currentChannel = channelId;
        this.currentTag = null;
        this.renderChannels();
        this.loadPosts();
    }

    filterByTag(tag) {
        this.currentTag = tag;
        this.currentChannel = 'all';
        this.renderChannels();
        this.loadPosts();
    }

    filterBy(filter) {
        this.currentFilter = filter;
        
        // Mettre à jour l'UI des boutons
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.loadPosts();
    }

    // Fonction pour toggle la section des filtres
    toggleFiltersSection() {
        const content = document.getElementById('communityFiltersContent');
        const toggleBtn = document.getElementById('communityFiltersToggleBtn');
        
        if (content && toggleBtn) {
            const isCollapsed = content.classList.contains('collapsed');
            
            if (isCollapsed) {
                content.classList.remove('collapsed');
                toggleBtn.querySelector('i').classList.replace('fa-chevron-down', 'fa-chevron-up');
            } else {
                content.classList.add('collapsed');
                toggleBtn.querySelector('i').classList.replace('fa-chevron-up', 'fa-chevron-down');
            }
        }
    }

    stripMarkdown(text) {
        return text
            .replace(/[#*_~`]/g, '')
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
            .replace(/\n/g, ' ');
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
        const postsGrid = document.getElementById('postsGrid');
        if (postsGrid) {
            postsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px;">
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