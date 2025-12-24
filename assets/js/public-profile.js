/* ============================================
   ALPHAVAULT AI - PUBLIC PROFILE
   Profil Public d'un Utilisateur
   ============================================ */

class PublicProfile {
    constructor() {
        this.userId = null;
        this.userData = null;
        this.isFollowing = false;
        this.profileContainer = document.getElementById('profileContainer');
    }

    async initialize() {
        try {
            // Récupérer l'ID utilisateur depuis l'URL
            const urlParams = new URLSearchParams(window.location.search);
            this.userId = urlParams.get('uid');

            if (!this.userId) {
                this.showError('User not found');
                return;
            }

            // Charger les données utilisateur
            await this.loadUserData();

            // Vérifier si l'utilisateur actuel suit cette personne
            this.isFollowing = await window.followSystem.isFollowing(this.userId);

            // Afficher le profil
            this.renderProfile();

            console.log('✅ Public Profile initialized');
        } catch (error) {
            console.error('❌ Error loading profile:', error);
            this.showError('Failed to load profile');
        }
    }

    async loadUserData() {
        const userDoc = await firebase.firestore()
            .collection('users')
            .doc(this.userId)
            .get();

        if (!userDoc.exists) {
            throw new Error('User not found');
        }

        this.userData = { uid: userDoc.id, ...userDoc.data() };
    }

    renderProfile() {
        const avatar = this.userData.photoURL || 
            `https://ui-avatars.com/api/?name=${encodeURIComponent(this.userData.displayName || this.userData.email)}&background=667eea&color=fff&size=256`;

        const currentUser = firebase.auth().currentUser;
        const isOwnProfile = currentUser && currentUser.uid === this.userId;

        const followButton = !isOwnProfile ? `
            <button 
                id="followBtn" 
                class="create-post-btn" 
                onclick="window.publicProfile.toggleFollow()"
                style="margin-top: 24px;"
            >
                <i class="fas ${this.isFollowing ? 'fa-user-minus' : 'fa-user-plus'}"></i>
                ${this.isFollowing ? 'Unfollow' : 'Follow'}
            </button>
        ` : '';

        this.profileContainer.innerHTML = `
            <!-- Profile Header -->
            <div style="text-align: center; padding: 40px;">
                <img 
                    src="${avatar}" 
                    alt="${this.userData.displayName || 'User'}" 
                    style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 4px solid var(--accent-color); margin-bottom: 24px;"
                    onerror="this.src='https://ui-avatars.com/api/?name=User&background=667eea&color=fff&size=256'"
                >
                
                <h1 style="font-size: 2rem; font-weight: 900; margin-bottom: 8px;">
                    ${this.userData.displayName || this.userData.email?.split('@')[0] || 'User'}
                </h1>
                
                <p style="color: var(--text-secondary); font-size: 1.1rem; margin-bottom: 16px;">
                    ${this.userData.email || ''}
                </p>

                ${this.userData.company ? `
                    <p style="color: var(--text-secondary); font-size: 1rem;">
                        <i class="fas fa-building"></i> ${this.userData.company}
                    </p>
                ` : ''}

                ${followButton}
            </div>

            <!-- Stats -->
            <div class="community-header-stats" style="margin-top: 32px;">
                <div class="stat-card">
                    <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #1D4ED8);">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-value">${this.userData.postCount || 0}</div>
                        <div class="stat-label">Posts</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #6366F1);">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-value">${this.userData.followersCount || 0}</div>
                        <div class="stat-label">Followers</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
                        <i class="fas fa-user-friends"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-value">${this.userData.followingCount || 0}</div>
                        <div class="stat-label">Following</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-value">${this.userData.reputation || 0}</div>
                        <div class="stat-label">Reputation</div>
                    </div>
                </div>
            </div>

            <!-- Recent Posts -->
            <div style="margin-top: 48px;">
                <h2 class="section-title">
                    <i class="fas fa-newspaper"></i> Recent Posts
                </h2>
                <div id="userPosts">
                    <div style="text-align: center; padding: 40px;">
                        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #3B82F6;"></i>
                    </div>
                </div>
            </div>
        `;

        // Charger les posts de l'utilisateur
        this.loadUserPosts();
    }

    async toggleFollow() {
        try {
            const followBtn = document.getElementById('followBtn');
            followBtn.disabled = true;

            if (this.isFollowing) {
                await window.followSystem.unfollowUser(this.userId);
                this.isFollowing = false;
                followBtn.innerHTML = '<i class="fas fa-user-plus"></i> Follow';
            } else {
                await window.followSystem.followUser(this.userId);
                this.isFollowing = true;
                followBtn.innerHTML = '<i class="fas fa-user-minus"></i> Unfollow';
            }

            // Recharger les données
            await this.loadUserData();
            this.renderProfile();

        } catch (error) {
            console.error('❌ Error toggling follow:', error);
            alert('Failed to update follow status');
        }
    }

    async loadUserPosts() {
        try {
            const postsSnapshot = await firebase.firestore()
                .collection('community_posts')
                .where('authorId', '==', this.userId)
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();

            const userPostsDiv = document.getElementById('userPosts');

            if (postsSnapshot.empty) {
                userPostsDiv.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                        <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.5;"></i>
                        <p>No posts yet</p>
                    </div>
                `;
                return;
            }

            const postsHTML = postsSnapshot.docs.map(doc => {
                const post = { id: doc.id, ...doc.data() };
                return this.createPostCard(post);
            }).join('');

            userPostsDiv.innerHTML = `<div class="posts-grid">${postsHTML}</div>`;

        } catch (error) {
            console.error('❌ Error loading user posts:', error);
        }
    }

    createPostCard(post) {
        const timeAgo = this.formatTimeAgo(post.createdAt?.toDate());
        
        return `
            <div class="post-card" onclick="window.location.href='post.html?id=${post.id}'">
                <h3 class="post-title">${this.escapeHtml(post.title)}</h3>
                <p class="post-excerpt">${this.createExcerpt(post.content, 100)}</p>
                <div class="post-footer">
                    <div class="post-stats">
                        <div class="post-stat">
                            <i class="fas fa-arrow-up"></i>
                            <span>${post.upvotes || 0}</span>
                        </div>
                        <div class="post-stat">
                            <i class="fas fa-comment"></i>
                            <span>${post.commentCount || 0}</span>
                        </div>
                        <div class="post-stat">
                            <i class="fas fa-clock"></i>
                            <span>${timeAgo}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    formatTimeAgo(date) {
        if (!date) return 'Just now';
        const seconds = Math.floor((new Date() - date) / 1000);
        const intervals = {
            year: 31536000, month: 2592000, week: 604800,
            day: 86400, hour: 3600, minute: 60
        };
        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
        }
        return 'Just now';
    }

    createExcerpt(content, maxLength) {
        const text = content.replace(/[#*`]/g, '').trim();
        return text.length <= maxLength ? this.escapeHtml(text) : this.escapeHtml(text.substring(0, maxLength)) + '...';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        this.profileContainer.innerHTML = `
            <div style="text-align: center; padding: 60px; color: var(--text-secondary);">
                <i class="fas fa-exclamation-triangle" style="font-size: 4rem; margin-bottom: 20px; color: #ef4444;"></i>
                <h3 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 12px;">${message}</h3>
                <button class="filter-btn" onclick="history.back()">
                    <i class="fas fa-arrow-left"></i> Go Back
                </button>
            </div>
        `;
    }
}

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    window.publicProfile = new PublicProfile();
    window.publicProfile.initialize();
});