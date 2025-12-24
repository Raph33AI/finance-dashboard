// /* ============================================
//    ALPHAVAULT AI - PUBLIC PROFILE
//    Profil Public d'un Utilisateur
//    ============================================ */

// class PublicProfile {
//     constructor() {
//         this.userId = null;
//         this.userData = null;
//         this.isFollowing = false;
//         this.profileContainer = document.getElementById('profileContainer');
//     }

//     async initialize() {
//         try {
//             // Récupérer l'ID utilisateur depuis l'URL
//             const urlParams = new URLSearchParams(window.location.search);
//             this.userId = urlParams.get('uid');

//             if (!this.userId) {
//                 this.showError('User not found');
//                 return;
//             }

//             // Charger les données utilisateur
//             await this.loadUserData();

//             // Vérifier si l'utilisateur actuel suit cette personne
//             this.isFollowing = await window.followSystem.isFollowing(this.userId);

//             // Afficher le profil
//             this.renderProfile();

//             console.log('✅ Public Profile initialized');
//         } catch (error) {
//             console.error('❌ Error loading profile:', error);
//             this.showError('Failed to load profile');
//         }
//     }

//     async loadUserData() {
//         const userDoc = await firebase.firestore()
//             .collection('users')
//             .doc(this.userId)
//             .get();

//         if (!userDoc.exists) {
//             throw new Error('User not found');
//         }

//         this.userData = { uid: userDoc.id, ...userDoc.data() };
//     }

//     renderProfile() {
//         const avatar = this.userData.photoURL || 
//             `https://ui-avatars.com/api/?name=${encodeURIComponent(this.userData.displayName || this.userData.email)}&background=667eea&color=fff&size=256`;

//         const currentUser = firebase.auth().currentUser;
//         const isOwnProfile = currentUser && currentUser.uid === this.userId;

//         const followButton = !isOwnProfile ? `
//             <button 
//                 id="followBtn" 
//                 class="create-post-btn" 
//                 onclick="window.publicProfile.toggleFollow()"
//                 style="margin-top: 24px;"
//             >
//                 <i class="fas ${this.isFollowing ? 'fa-user-minus' : 'fa-user-plus'}"></i>
//                 ${this.isFollowing ? 'Unfollow' : 'Follow'}
//             </button>
//         ` : '';

//         this.profileContainer.innerHTML = `
//             <!-- Profile Header -->
//             <div style="text-align: center; padding: 40px;">
//                 <img 
//                     src="${avatar}" 
//                     alt="${this.userData.displayName || 'User'}" 
//                     style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 4px solid var(--accent-color); margin-bottom: 24px;"
//                     onerror="this.src='https://ui-avatars.com/api/?name=User&background=667eea&color=fff&size=256'"
//                 >
                
//                 <h1 style="font-size: 2rem; font-weight: 900; margin-bottom: 8px;">
//                     ${this.userData.displayName || this.userData.email?.split('@')[0] || 'User'}
//                 </h1>
                
//                 <p style="color: var(--text-secondary); font-size: 1.1rem; margin-bottom: 16px;">
//                     ${this.userData.email || ''}
//                 </p>

//                 ${this.userData.company ? `
//                     <p style="color: var(--text-secondary); font-size: 1rem;">
//                         <i class="fas fa-building"></i> ${this.userData.company}
//                     </p>
//                 ` : ''}

//                 ${followButton}
//             </div>

//             <!-- Stats -->
//             <div class="community-header-stats" style="margin-top: 32px;">
//                 <div class="stat-card">
//                     <div class="stat-icon" style="background: linear-gradient(135deg, #3B82F6, #1D4ED8);">
//                         <i class="fas fa-file-alt"></i>
//                     </div>
//                     <div class="stat-info">
//                         <div class="stat-value">${this.userData.postCount || 0}</div>
//                         <div class="stat-label">Posts</div>
//                     </div>
//                 </div>
//                 <div class="stat-card">
//                     <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #6366F1);">
//                         <i class="fas fa-users"></i>
//                     </div>
//                     <div class="stat-info">
//                         <div class="stat-value">${this.userData.followersCount || 0}</div>
//                         <div class="stat-label">Followers</div>
//                     </div>
//                 </div>
//                 <div class="stat-card">
//                     <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
//                         <i class="fas fa-user-friends"></i>
//                     </div>
//                     <div class="stat-info">
//                         <div class="stat-value">${this.userData.followingCount || 0}</div>
//                         <div class="stat-label">Following</div>
//                     </div>
//                 </div>
//                 <div class="stat-card">
//                     <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
//                         <i class="fas fa-trophy"></i>
//                     </div>
//                     <div class="stat-info">
//                         <div class="stat-value">${this.userData.reputation || 0}</div>
//                         <div class="stat-label">Reputation</div>
//                     </div>
//                 </div>
//             </div>

//             <!-- Recent Posts -->
//             <div style="margin-top: 48px;">
//                 <h2 class="section-title">
//                     <i class="fas fa-newspaper"></i> Recent Posts
//                 </h2>
//                 <div id="userPosts">
//                     <div style="text-align: center; padding: 40px;">
//                         <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #3B82F6;"></i>
//                     </div>
//                 </div>
//             </div>
//         `;

//         // Charger les posts de l'utilisateur
//         this.loadUserPosts();
//     }

//     async toggleFollow() {
//         try {
//             const followBtn = document.getElementById('followBtn');
//             followBtn.disabled = true;

//             if (this.isFollowing) {
//                 await window.followSystem.unfollowUser(this.userId);
//                 this.isFollowing = false;
//                 followBtn.innerHTML = '<i class="fas fa-user-plus"></i> Follow';
//             } else {
//                 await window.followSystem.followUser(this.userId);
//                 this.isFollowing = true;
//                 followBtn.innerHTML = '<i class="fas fa-user-minus"></i> Unfollow';
//             }

//             // Recharger les données
//             await this.loadUserData();
//             this.renderProfile();

//         } catch (error) {
//             console.error('❌ Error toggling follow:', error);
//             alert('Failed to update follow status');
//         }
//     }

//     async loadUserPosts() {
//         try {
//             const postsSnapshot = await firebase.firestore()
//                 .collection('community_posts')
//                 .where('authorId', '==', this.userId)
//                 .orderBy('createdAt', 'desc')
//                 .limit(10)
//                 .get();

//             const userPostsDiv = document.getElementById('userPosts');

//             if (postsSnapshot.empty) {
//                 userPostsDiv.innerHTML = `
//                     <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
//                         <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.5;"></i>
//                         <p>No posts yet</p>
//                     </div>
//                 `;
//                 return;
//             }

//             const postsHTML = postsSnapshot.docs.map(doc => {
//                 const post = { id: doc.id, ...doc.data() };
//                 return this.createPostCard(post);
//             }).join('');

//             userPostsDiv.innerHTML = `<div class="posts-grid">${postsHTML}</div>`;

//         } catch (error) {
//             console.error('❌ Error loading user posts:', error);
//         }
//     }

//     createPostCard(post) {
//         const timeAgo = this.formatTimeAgo(post.createdAt?.toDate());
        
//         return `
//             <div class="post-card" onclick="window.location.href='post.html?id=${post.id}'">
//                 <h3 class="post-title">${this.escapeHtml(post.title)}</h3>
//                 <p class="post-excerpt">${this.createExcerpt(post.content, 100)}</p>
//                 <div class="post-footer">
//                     <div class="post-stats">
//                         <div class="post-stat">
//                             <i class="fas fa-arrow-up"></i>
//                             <span>${post.upvotes || 0}</span>
//                         </div>
//                         <div class="post-stat">
//                             <i class="fas fa-comment"></i>
//                             <span>${post.commentCount || 0}</span>
//                         </div>
//                         <div class="post-stat">
//                             <i class="fas fa-clock"></i>
//                             <span>${timeAgo}</span>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         `;
//     }

//     formatTimeAgo(date) {
//         if (!date) return 'Just now';
//         const seconds = Math.floor((new Date() - date) / 1000);
//         const intervals = {
//             year: 31536000, month: 2592000, week: 604800,
//             day: 86400, hour: 3600, minute: 60
//         };
//         for (const [unit, secondsInUnit] of Object.entries(intervals)) {
//             const interval = Math.floor(seconds / secondsInUnit);
//             if (interval >= 1) return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
//         }
//         return 'Just now';
//     }

//     createExcerpt(content, maxLength) {
//         const text = content.replace(/[#*`]/g, '').trim();
//         return text.length <= maxLength ? this.escapeHtml(text) : this.escapeHtml(text.substring(0, maxLength)) + '...';
//     }

//     escapeHtml(text) {
//         const div = document.createElement('div');
//         div.textContent = text;
//         return div.innerHTML;
//     }

//     showError(message) {
//         this.profileContainer.innerHTML = `
//             <div style="text-align: center; padding: 60px; color: var(--text-secondary);">
//                 <i class="fas fa-exclamation-triangle" style="font-size: 4rem; margin-bottom: 20px; color: #ef4444;"></i>
//                 <h3 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 12px;">${message}</h3>
//                 <button class="filter-btn" onclick="history.back()">
//                     <i class="fas fa-arrow-left"></i> Go Back
//                 </button>
//             </div>
//         `;
//     }
// }

// // Initialiser au chargement de la page
// document.addEventListener('DOMContentLoaded', () => {
//     window.publicProfile = new PublicProfile();
//     window.publicProfile.initialize();
// });

/* ============================================
   PUBLIC-PROFILE.JS - Profil Public v3.0
   ✅ Avec Bio + Activity Tabs (Posts/Liked/Commented)
   ============================================ */

class PublicProfile {
    constructor() {
        this.userId = null;
        this.userData = null;
        this.isFollowing = false;
        this.isOwnProfile = false;
        this.currentTab = 'posts';
        
        // Collections d'activité
        this.userPosts = [];
        this.likedPosts = [];
        this.commentedPosts = [];
    }

    async initialize() {
        try {
            console.log('👤 Initializing Public Profile...');
            
            const urlParams = new URLSearchParams(window.location.search);
            this.userId = urlParams.get('uid');

            if (!this.userId) {
                this.showError('User not found');
                return;
            }

            // Vérifier si c'est son propre profil
            const currentUser = firebase.auth().currentUser;
            this.isOwnProfile = currentUser && currentUser.uid === this.userId;

            await this.loadUserData();
            
            // Vérifier le statut de suivi (sauf si c'est son propre profil)
            if (!this.isOwnProfile && currentUser) {
                this.isFollowing = await window.followSystem.isFollowing(this.userId);
            }
            
            // ✅ Charger toutes les activités
            await this.loadAllActivities();
            
            console.log('✅ Public Profile initialized');
        } catch (error) {
            console.error('❌ Error initializing profile:', error);
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

        this.userData = { uid: this.userId, ...userDoc.data() };
        this.renderProfileHeader();
    }

    // ✅ CHARGER TOUTES LES ACTIVITÉS
    async loadAllActivities() {
        await Promise.all([
            this.loadUserPosts(),
            this.loadLikedPosts(),
            this.loadCommentedPosts()
        ]);
        
        // Afficher l'onglet par défaut
        this.switchTab('posts');
    }

    async loadUserPosts() {
        try {
            const snapshot = await firebase.firestore()
                .collection('community_posts')
                .where('authorId', '==', this.userId)
                .orderBy('createdAt', 'desc')
                .limit(50)
                .get();

            this.userPosts = await Promise.all(snapshot.docs.map(async doc => {
                const postData = doc.data();
                return {
                    id: doc.id,
                    ...postData,
                    createdAt: postData.createdAt?.toDate()
                };
            }));

            document.getElementById('postsTabCount').textContent = this.userPosts.length;
            
            console.log(`✅ ${this.userPosts.length} posts chargés`);
        } catch (error) {
            console.error('❌ Error loading user posts:', error);
            this.userPosts = [];
        }
    }

    // ✅ CHARGER LES POSTS LIKÉS
    async loadLikedPosts() {
        try {
            // Récupérer les IDs des posts likés
            const likesSnapshot = await firebase.firestore()
                .collection('users')
                .doc(this.userId)
                .collection('likedPosts')
                .orderBy('likedAt', 'desc')
                .limit(50)
                .get();

            if (likesSnapshot.empty) {
                this.likedPosts = [];
                document.getElementById('likedTabCount').textContent = '0';
                return;
            }

            const postIds = likesSnapshot.docs.map(doc => doc.id);
            
            // Charger les posts par lots de 10 (limitation Firestore)
            const batchSize = 10;
            const batches = [];
            
            for (let i = 0; i < postIds.length; i += batchSize) {
                const batchIds = postIds.slice(i, i + batchSize);
                const batchSnapshot = await firebase.firestore()
                    .collection('community_posts')
                    .where(firebase.firestore.FieldPath.documentId(), 'in', batchIds)
                    .get();
                
                batches.push(...batchSnapshot.docs);
            }

            this.likedPosts = batches.map(doc => {
                const postData = doc.data();
                return {
                    id: doc.id,
                    ...postData,
                    createdAt: postData.createdAt?.toDate()
                };
            }).filter(post => post !== null);

            document.getElementById('likedTabCount').textContent = this.likedPosts.length;
            
            console.log(`✅ ${this.likedPosts.length} posts likés chargés`);
        } catch (error) {
            console.error('❌ Error loading liked posts:', error);
            this.likedPosts = [];
            document.getElementById('likedTabCount').textContent = '0';
        }
    }

    // ✅ CHARGER LES POSTS COMMENTÉS
    async loadCommentedPosts() {
        try {
            // Récupérer tous les commentaires de l'utilisateur
            const commentsSnapshot = await firebase.firestore()
                .collectionGroup('comments')
                .where('authorId', '==', this.userId)
                .orderBy('createdAt', 'desc')
                .limit(100)
                .get();

            if (commentsSnapshot.empty) {
                this.commentedPosts = [];
                document.getElementById('commentedTabCount').textContent = '0';
                return;
            }

            // Extraire les IDs de posts uniques
            const postIdsSet = new Set();
            commentsSnapshot.docs.forEach(doc => {
                const commentRef = doc.ref;
                const postId = commentRef.parent.parent.id;
                postIdsSet.add(postId);
            });

            const postIds = Array.from(postIdsSet);

            // Charger les posts par lots de 10
            const batchSize = 10;
            const batches = [];
            
            for (let i = 0; i < postIds.length; i += batchSize) {
                const batchIds = postIds.slice(i, i + batchSize);
                const batchSnapshot = await firebase.firestore()
                    .collection('community_posts')
                    .where(firebase.firestore.FieldPath.documentId(), 'in', batchIds)
                    .get();
                
                batches.push(...batchSnapshot.docs);
            }

            this.commentedPosts = batches.map(doc => {
                const postData = doc.data();
                return {
                    id: doc.id,
                    ...postData,
                    createdAt: postData.createdAt?.toDate()
                };
            }).filter(post => post !== null);

            document.getElementById('commentedTabCount').textContent = this.commentedPosts.length;
            
            console.log(`✅ ${this.commentedPosts.length} posts commentés chargés`);
        } catch (error) {
            console.error('❌ Error loading commented posts:', error);
            this.commentedPosts = [];
            document.getElementById('commentedTabCount').textContent = '0';
        }
    }

    // ✅ CHANGER D'ONGLET
    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Mettre à jour les boutons
        document.querySelectorAll('[data-tab]').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });
        
        // Afficher le contenu correspondant
        this.renderTabContent();
    }

    renderTabContent() {
        const activityContent = document.getElementById('activityContent');
        let posts = [];
        let emptyMessage = '';
        
        switch(this.currentTab) {
            case 'posts':
                posts = this.userPosts;
                emptyMessage = 'No posts yet';
                break;
            case 'liked':
                posts = this.likedPosts;
                emptyMessage = 'No liked posts yet';
                break;
            case 'commented':
                posts = this.commentedPosts;
                emptyMessage = 'No commented posts yet';
                break;
        }
        
        if (posts.length === 0) {
            activityContent.innerHTML = `
                <div style="text-align: center; padding: 60px; color: var(--text-secondary); grid-column: 1 / -1;">
                    <i class="fas fa-inbox" style="font-size: 4rem; margin-bottom: 20px; opacity: 0.5;"></i>
                    <p style="font-size: 1.2rem; font-weight: 700;">${emptyMessage}</p>
                </div>
            `;
            return;
        }
        
        const postsHTML = posts.map(post => this.createPostCard(post)).join('');
        activityContent.innerHTML = postsHTML;
    }

    createPostCard(post) {
        const timeAgo = this.formatTimeAgo(post.createdAt);
        const excerpt = this.createExcerpt(post.content, 120);
        
        return `
            <div class="user-post-item" onclick="window.location.href='post.html?id=${post.id}'" 
                 style="background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: 16px; padding: 20px; transition: all 0.3s ease; cursor: pointer; height: fit-content;">
                <h3 class="user-post-title gradient-title" style="font-size: 1.3rem; font-weight: 800; margin-bottom: 12px; line-height: 1.4;">
                    ${this.escapeHtml(post.title)}
                </h3>
                <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; margin-bottom: 16px;">
                    ${excerpt}
                </p>
                <div class="user-post-meta" style="display: flex; gap: 20px; color: var(--text-secondary); font-size: 0.9rem; font-weight: 600; flex-wrap: wrap;">
                    <span style="display: flex; align-items: center; gap: 6px;">
                        <i class="fas fa-arrow-up" style="color: #10B981;"></i> 
                        ${post.upvotes || 0}
                    </span>
                    <span style="display: flex; align-items: center; gap: 6px;">
                        <i class="fas fa-comment" style="color: #3B82F6;"></i> 
                        ${post.commentCount || 0}
                    </span>
                    <span style="display: flex; align-items: center; gap: 6px;">
                        <i class="fas fa-eye" style="color: #8B5CF6;"></i> 
                        ${post.viewCount || 0}
                    </span>
                    <span style="display: flex; align-items: center; gap: 6px;">
                        <i class="fas fa-clock"></i> 
                        ${timeAgo}
                    </span>
                </div>
            </div>
        `;
    }

    renderProfileHeader() {
        // ✅ Récupération des données avec prénom/nom/bio
        const firstName = this.userData.firstName || '';
        const lastName = this.userData.lastName || '';
        const displayName = `${firstName} ${lastName}`.trim() || 
                           this.userData.displayName || 
                           this.userData.email?.split('@')[0] || 
                           'Unknown User';
        
        const bio = this.userData.bio || 'No biography available';
        const reputation = this.userData.reputation || 0;
        const postCount = this.userData.postCount || 0;
        const badges = this.userData.badges || [];
        const followersCount = this.userData.followersCount || 0;
        const followingCount = this.userData.followingCount || 0;

        // ✅ Photo de profil avec fallback
        const photoURL = this.userData.photoURL;
        const avatarHTML = photoURL ? `
            <img 
                src="${photoURL}" 
                alt="${this.escapeHtml(displayName)}" 
                class="profile-avatar-large"
                style="width: 140px; height: 140px; border-radius: 50%; object-fit: cover; box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5); border: 5px solid rgba(255, 255, 255, 0.2);"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            >
            <div class="profile-avatar-large-fallback" style="display: none; width: 140px; height: 140px; border-radius: 50%; background: linear-gradient(135deg, #3B82F6, #8B5CF6); align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 3.5rem; box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5); border: 5px solid rgba(255, 255, 255, 0.2);">
                ${displayName.charAt(0).toUpperCase()}
            </div>
        ` : `
            <div class="profile-avatar-large" style="width: 140px; height: 140px; border-radius: 50%; background: linear-gradient(135deg, #3B82F6, #8B5CF6); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 3.5rem; box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5); border: 5px solid rgba(255, 255, 255, 0.2);">
                ${displayName.charAt(0).toUpperCase()}
            </div>
        `;

        const badgesHTML = badges.map(badge => {
            const badgeInfo = this.getBadgeInfo(badge);
            return `
                <div class="profile-badge" style="padding: 10px 20px; border-radius: 12px; background: ${badgeInfo.gradient}; color: white; font-weight: 800; font-size: 0.9rem; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.2); margin-right: 12px; margin-bottom: 12px;">
                    <i class="${badgeInfo.icon}"></i>
                    <span>${badgeInfo.name}</span>
                </div>
            `;
        }).join('');

        // Bouton Follow/Unfollow (masqué si propre profil)
        const followButtonHTML = !this.isOwnProfile ? `
            <button 
                id="followBtn" 
                class="create-post-btn" 
                onclick="window.publicProfile.toggleFollow()"
                style="margin-top: 24px; ${this.isFollowing ? 'background: linear-gradient(135deg, #6b7280, #4b5563);' : ''}"
            >
                <i class="fas ${this.isFollowing ? 'fa-user-minus' : 'fa-user-plus'}"></i>
                ${this.isFollowing ? 'Unfollow' : 'Follow'}
            </button>
        ` : `
            <a href="user-profile.html" class="create-post-btn" style="margin-top: 24px; text-decoration: none;">
                <i class="fas fa-edit"></i>
                Edit My Profile
            </a>
        `;

        const profileHTML = `
            <div style="display: flex; align-items: center; gap: 40px; flex-wrap: wrap;">
                ${avatarHTML}
                <div style="flex: 1; min-width: 300px;">
                    <h1 class="profile-name" style="font-size: 2.8rem; font-weight: 900; margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
                        <span class="gradient-title">${this.escapeHtml(displayName)}</span>
                        ${badges.includes('verified-analyst') ? '<i class="fas fa-badge-check" style="color: #3B82F6; font-size: 2rem;"></i>' : ''}
                    </h1>
                    <p class="profile-bio" style="color: var(--text-secondary); font-size: 1.15rem; line-height: 1.7; margin-bottom: 28px; max-width: 600px;">
                        ${this.escapeHtml(bio)}
                    </p>
                    
                    <div class="profile-stats" style="display: flex; gap: 32px; flex-wrap: wrap; margin-bottom: 24px;">
                        <div class="profile-stat-item">
                            <div class="profile-stat-value gradient-title" style="font-size: 2rem; font-weight: 900;">${reputation.toLocaleString()}</div>
                            <div class="profile-stat-label" style="font-size: 0.9rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Reputation</div>
                        </div>
                        <div class="profile-stat-item">
                            <div class="profile-stat-value gradient-title" style="font-size: 2rem; font-weight: 900;">${postCount}</div>
                            <div class="profile-stat-label" style="font-size: 0.9rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Posts</div>
                        </div>
                        <div class="profile-stat-item">
                            <div class="profile-stat-value gradient-title" style="font-size: 2rem; font-weight: 900;" id="followersCount">${followersCount}</div>
                            <div class="profile-stat-label" style="font-size: 0.9rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Followers</div>
                        </div>
                        <div class="profile-stat-item">
                            <div class="profile-stat-value gradient-title" style="font-size: 2rem; font-weight: 900;">${followingCount}</div>
                            <div class="profile-stat-label" style="font-size: 0.9rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Following</div>
                        </div>
                        <div class="profile-stat-item">
                            <div class="profile-stat-value gradient-title" style="font-size: 2rem; font-weight: 900;">${badges.length}</div>
                            <div class="profile-stat-label" style="font-size: 0.9rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Badges</div>
                        </div>
                    </div>

                    ${badges.length > 0 ? `<div class="profile-badges">${badgesHTML}</div>` : ''}
                    
                    ${followButtonHTML}
                </div>
            </div>
        `;

        document.getElementById('profileHeader').innerHTML = profileHTML;
        document.title = `${displayName} - AlphaVault AI`;
    }

    async toggleFollow() {
        try {
            const followBtn = document.getElementById('followBtn');
            const followersCountEl = document.getElementById('followersCount');
            
            if (!followBtn) return;
            
            followBtn.disabled = true;
            followBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

            if (this.isFollowing) {
                await window.followSystem.unfollowUser(this.userId);
                this.isFollowing = false;
                followBtn.innerHTML = '<i class="fas fa-user-plus"></i> Follow';
                followBtn.style.background = '';
                
                if (followersCountEl) {
                    const currentCount = parseInt(followersCountEl.textContent) || 0;
                    followersCountEl.textContent = Math.max(0, currentCount - 1);
                }
                
                console.log('✅ User unfollowed');
            } else {
                await window.followSystem.followUser(this.userId);
                this.isFollowing = true;
                followBtn.innerHTML = '<i class="fas fa-user-minus"></i> Unfollow';
                followBtn.style.background = 'linear-gradient(135deg, #6b7280, #4b5563)';
                
                if (followersCountEl) {
                    const currentCount = parseInt(followersCountEl.textContent) || 0;
                    followersCountEl.textContent = currentCount + 1;
                }
                
                console.log('✅ User followed');
            }

            followBtn.disabled = false;

        } catch (error) {
            console.error('❌ Error toggling follow:', error);
            alert('Failed to update follow status. Please try again.');
            
            const followBtn = document.getElementById('followBtn');
            if (followBtn) {
                followBtn.disabled = false;
                followBtn.innerHTML = this.isFollowing 
                    ? '<i class="fas fa-user-minus"></i> Unfollow' 
                    : '<i class="fas fa-user-plus"></i> Follow';
            }
        }
    }

    getBadgeInfo(badge) {
        const badges = {
            'verified-analyst': { name: 'Verified Analyst', icon: 'fas fa-badge-check', gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' },
            'top-contributor': { name: 'Top Contributor', icon: 'fas fa-trophy', gradient: 'linear-gradient(135deg, #8B5CF6, #6366F1)' },
            'platinum-member': { name: 'Platinum Member', icon: 'fas fa-star', gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)' }
        };
        return badges[badge] || { name: badge, icon: 'fas fa-award', gradient: 'linear-gradient(135deg, #6b7280, #4b5563)' };
    }

    formatTimeAgo(date) {
        if (!date) return 'Unknown';
        const seconds = Math.floor((new Date() - date) / 1000);
        const intervals = { year: 31536000, month: 2592000, week: 604800, day: 86400, hour: 3600, minute: 60 };
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
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        document.getElementById('profileHeader').innerHTML = `
            <div style="text-align: center; padding: 60px; color: #EF4444; width: 100%;">
                <i class="fas fa-exclamation-triangle" style="font-size: 4rem; margin-bottom: 20px;"></i>
                <h3 style="font-size: 1.5rem; font-weight: 800;">${message}</h3>
                <button class="filter-btn" onclick="history.back()" style="margin-top: 24px;">
                    <i class="fas fa-arrow-left"></i> Go Back
                </button>
            </div>
        `;
    }
}

// ✅ Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    window.publicProfile = new PublicProfile();
    window.publicProfile.initialize();
});

console.log('✅ public-profile.js chargé (v3.0 - avec Bio + Activity Tabs)');