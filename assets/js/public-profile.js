// /* ============================================
//    PUBLIC-PROFILE.JS - Profil Public v3.2
//    ✅ Avec Bio + Activity Tabs (Posts/Liked/Commented)
//    ✅ CORRECTION : Photo de profil avec multiples fallbacks
//    ✅ CORRECTION : Listener temps réel pour le statut Follow/Unfollow
//    ✅ CORRECTION : Persistance du bouton Follow après refresh
//    ============================================ */

// class PublicProfile {
//     constructor() {
//         this.userId = null;
//         this.userData = null;
//         this.isFollowing = false;
//         this.isOwnProfile = false;
//         this.currentTab = 'posts';
        
//         // Collections d'activité
//         this.userPosts = [];
//         this.likedPosts = [];
//         this.commentedPosts = [];
        
//         // Listener unsubscribe
//         this.followUnsubscribe = null;
//     }

//     async initialize() {
//         try {
//             console.log('👤 Initializing Public Profile...');
            
//             const urlParams = new URLSearchParams(window.location.search);
//             this.userId = urlParams.get('id');

//             if (!this.userId) {
//                 this.showError('User not found');
//                 return;
//             }

//             // Vérifier si c'est son propre profil
//             const currentUser = firebase.auth().currentUser;
//             this.isOwnProfile = currentUser && currentUser.uid === this.userId;

//             // ✅ Charger les données utilisateur
//             await this.loadUserData();
            
//             // ✅ CORRECTION : Vérifier ET ATTENDRE le statut de suivi AVANT de rendre
//             if (!this.isOwnProfile && currentUser) {
//                 // ✅ IMPORTANT : ATTENDRE la vérification complète
//                 console.log('🔍 Vérification du statut de suivi...');
//                 this.isFollowing = await window.followSystem.isFollowing(this.userId);
//                 console.log('✅ Statut de suivi confirmé:', this.isFollowing);
                
//                 // ✅ ENSUITE mettre en place le listener
//                 this.setupFollowListener();
//             }
            
//             // ✅ MAINTENANT rendre le header avec le VRAI statut
//             this.renderProfileHeader();
            
//             // Charger toutes les activités
//             await this.loadAllActivities();
            
//             console.log('✅ Public Profile initialized');
//         } catch (error) {
//             console.error('❌ Error initializing profile:', error);
//             this.showError('Failed to load profile');
//         }
//     }

//     // ✅ CORRECTION : Listener temps réel avec vérification immédiate
//     setupFollowListener() {
//         const currentUser = firebase.auth().currentUser;
//         if (!currentUser || this.isOwnProfile) return;
        
//         console.log('👂 Setting up follow status listener...');
        
//         // Écouter les changements dans la sous-collection "following"
//         this.followUnsubscribe = firebase.firestore()
//             .collection('users')
//             .doc(currentUser.uid)
//             .collection('following')
//             .doc(this.userId)
//             .onSnapshot((doc) => {
//                 const newFollowStatus = doc.exists;
                
//                 console.log('🔔 Follow status update from Firestore:', {
//                     docExists: doc.exists,
//                     previousStatus: this.isFollowing,
//                     newStatus: newFollowStatus
//                 });
                
//                 // ✅ IMPORTANT : Toujours mettre à jour, même si identique (pour le premier rendu)
//                 const statusChanged = this.isFollowing !== newFollowStatus;
                
//                 this.isFollowing = newFollowStatus;
                
//                 // Mettre à jour le bouton
//                 this.updateFollowButton();
                
//                 if (statusChanged) {
//                     console.log('✅ Follow status changed:', this.isFollowing);
//                 }
//             }, (error) => {
//                 console.error('❌ Error in follow listener:', error);
//             });
//     }

//     // ✅ NOUVELLE MÉTHODE : Mettre à jour uniquement le bouton Follow
//     updateFollowButton() {
//         const followBtn = document.getElementById('followBtn');
        
//         if (!followBtn) return;
        
//         console.log('🔄 Updating follow button, isFollowing:', this.isFollowing);
        
//         if (this.isFollowing) {
//             followBtn.innerHTML = '<i class="fas fa-user-minus"></i> Unfollow';
//             followBtn.style.background = 'linear-gradient(135deg, #6b7280, #4b5563)';
//         } else {
//             followBtn.innerHTML = '<i class="fas fa-user-plus"></i> Follow';
//             followBtn.style.background = '';
//         }
        
//         followBtn.disabled = false;
//     }

//     async loadUserData() {
//         const userDoc = await firebase.firestore()
//             .collection('users')
//             .doc(this.userId)
//             .get();

//         if (!userDoc.exists) {
//             throw new Error('User not found');
//         }

//         this.userData = { uid: this.userId, ...userDoc.data() };
//         console.log('✅ User data loaded:', this.userData);
//     }

//     // ✅ CHARGER TOUTES LES ACTIVITÉS
//     async loadAllActivities() {
//         await Promise.all([
//             this.loadUserPosts(),
//             this.loadLikedPosts(),
//             this.loadCommentedPosts()
//         ]);
        
//         // Afficher l'onglet par défaut
//         this.switchTab('posts');
//     }

//     async loadUserPosts() {
//         try {
//             const snapshot = await firebase.firestore()
//                 .collection('posts')
//                 .where('authorId', '==', this.userId)
//                 .orderBy('createdAt', 'desc')
//                 .limit(50)
//                 .get();

//             this.userPosts = snapshot.docs.map(doc => {
//                 const postData = doc.data();
//                 return {
//                     id: doc.id,
//                     ...postData,
//                     createdAt: postData.createdAt?.toDate()
//                 };
//             });

//             document.getElementById('postsTabCount').textContent = this.userPosts.length;
            
//             console.log(`✅ ${this.userPosts.length} posts chargés`);
//         } catch (error) {
//             console.error('❌ Error loading user posts:', error);
//             this.userPosts = [];
//             document.getElementById('postsTabCount').textContent = '0';
//         }
//     }

//     // ✅ CHARGER LES POSTS LIKÉS
//     async loadLikedPosts() {
//         try {
//             // Récupérer les IDs des posts likés
//             const likesSnapshot = await firebase.firestore()
//                 .collection('users')
//                 .doc(this.userId)
//                 .collection('likedPosts')
//                 .orderBy('likedAt', 'desc')
//                 .limit(50)
//                 .get();

//             if (likesSnapshot.empty) {
//                 this.likedPosts = [];
//                 document.getElementById('likedTabCount').textContent = '0';
//                 return;
//             }

//             const postIds = likesSnapshot.docs.map(doc => doc.id);
            
//             // Charger les posts par lots de 10 (limitation Firestore)
//             const batchSize = 10;
//             const batches = [];
            
//             for (let i = 0; i < postIds.length; i += batchSize) {
//                 const batchIds = postIds.slice(i, i + batchSize);
//                 const batchSnapshot = await firebase.firestore()
//                     .collection('posts')
//                     .where(firebase.firestore.FieldPath.documentId(), 'in', batchIds)
//                     .get();
                
//                 batches.push(...batchSnapshot.docs);
//             }

//             this.likedPosts = batches.map(doc => {
//                 const postData = doc.data();
//                 return {
//                     id: doc.id,
//                     ...postData,
//                     createdAt: postData.createdAt?.toDate()
//                 };
//             }).filter(post => post !== null);

//             document.getElementById('likedTabCount').textContent = this.likedPosts.length;
            
//             console.log(`✅ ${this.likedPosts.length} posts likés chargés`);
//         } catch (error) {
//             console.error('❌ Error loading liked posts:', error);
//             this.likedPosts = [];
//             document.getElementById('likedTabCount').textContent = '0';
//         }
//     }

//     // ✅ CHARGER LES POSTS COMMENTÉS
//     async loadCommentedPosts() {
//         try {
//             // Récupérer tous les commentaires de l'utilisateur
//             const commentsSnapshot = await firebase.firestore()
//                 .collection('comments')
//                 .where('authorId', '==', this.userId)
//                 .orderBy('createdAt', 'desc')
//                 .limit(100)
//                 .get();

//             if (commentsSnapshot.empty) {
//                 this.commentedPosts = [];
//                 document.getElementById('commentedTabCount').textContent = '0';
//                 return;
//             }

//             // Extraire les IDs de posts uniques depuis le champ 'postId'
//             const postIdsSet = new Set();
//             commentsSnapshot.docs.forEach(doc => {
//                 const comment = doc.data();
//                 if (comment.postId) {
//                     postIdsSet.add(comment.postId);
//                 }
//             });

//             const postIds = Array.from(postIdsSet);

//             if (postIds.length === 0) {
//                 this.commentedPosts = [];
//                 document.getElementById('commentedTabCount').textContent = '0';
//                 return;
//             }

//             // Charger les posts par lots de 10
//             const batchSize = 10;
//             const batches = [];
            
//             for (let i = 0; i < postIds.length; i += batchSize) {
//                 const batchIds = postIds.slice(i, i + batchSize);
//                 const batchSnapshot = await firebase.firestore()
//                     .collection('posts')
//                     .where(firebase.firestore.FieldPath.documentId(), 'in', batchIds)
//                     .get();
                
//                 batches.push(...batchSnapshot.docs);
//             }

//             this.commentedPosts = batches.map(doc => {
//                 const postData = doc.data();
//                 return {
//                     id: doc.id,
//                     ...postData,
//                     createdAt: postData.createdAt?.toDate()
//                 };
//             }).filter(post => post !== null);

//             document.getElementById('commentedTabCount').textContent = this.commentedPosts.length;
            
//             console.log(`✅ ${this.commentedPosts.length} posts commentés chargés`);
//         } catch (error) {
//             console.error('❌ Error loading commented posts:', error);
//             this.commentedPosts = [];
//             document.getElementById('commentedTabCount').textContent = '0';
//         }
//     }

//     // ✅ CHANGER D'ONGLET
//     switchTab(tabName) {
//         this.currentTab = tabName;
        
//         // Mettre à jour les boutons
//         document.querySelectorAll('[data-tab]').forEach(btn => {
//             btn.classList.remove('active');
//             if (btn.dataset.tab === tabName) {
//                 btn.classList.add('active');
//             }
//         });
        
//         // Afficher le contenu correspondant
//         this.renderTabContent();
//     }

//     renderTabContent() {
//         const activityContent = document.getElementById('activityContent');
//         let posts = [];
//         let emptyMessage = '';
        
//         switch(this.currentTab) {
//             case 'posts':
//                 posts = this.userPosts;
//                 emptyMessage = 'No posts yet';
//                 break;
//             case 'liked':
//                 posts = this.likedPosts;
//                 emptyMessage = 'No liked posts yet';
//                 break;
//             case 'commented':
//                 posts = this.commentedPosts;
//                 emptyMessage = 'No commented posts yet';
//                 break;
//         }
        
//         if (posts.length === 0) {
//             activityContent.innerHTML = `
//                 <div style="text-align: center; padding: 60px; color: var(--text-secondary); grid-column: 1 / -1;">
//                     <i class="fas fa-inbox" style="font-size: 4rem; margin-bottom: 20px; opacity: 0.5;"></i>
//                     <p style="font-size: 1.2rem; font-weight: 700;">${emptyMessage}</p>
//                 </div>
//             `;
//             return;
//         }
        
//         const postsHTML = posts.map(post => this.createPostCard(post)).join('');
//         activityContent.innerHTML = postsHTML;
//     }

//     createPostCard(post) {
//         const timeAgo = this.formatTimeAgo(post.createdAt);
//         const excerpt = this.createExcerpt(post.content, 120);
        
//         return `
//             <div class="user-post-item" onclick="window.location.href='post.html?id=${post.id}'" 
//                  style="background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: 16px; padding: 20px; transition: all 0.3s ease; cursor: pointer; height: fit-content;">
//                 <h3 class="user-post-title gradient-title" style="font-size: 1.3rem; font-weight: 800; margin-bottom: 12px; line-height: 1.4;">
//                     ${this.escapeHtml(post.title)}
//                 </h3>
//                 <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; margin-bottom: 16px;">
//                     ${excerpt}
//                 </p>
//                 <div class="user-post-meta" style="display: flex; gap: 20px; color: var(--text-secondary); font-size: 0.9rem; font-weight: 600; flex-wrap: wrap;">
//                     <span style="display: flex; align-items: center; gap: 6px;">
//                         <i class="fas fa-heart" style="color: #EF4444;"></i> 
//                         ${post.likes?.length || 0}
//                     </span>
//                     <span style="display: flex; align-items: center; gap: 6px;">
//                         <i class="fas fa-comment" style="color: #3B82F6;"></i> 
//                         ${post.commentsCount || 0}
//                     </span>
//                     <span style="display: flex; align-items: center; gap: 6px;">
//                         <i class="fas fa-eye" style="color: #8B5CF6;"></i> 
//                         ${post.views || 0}
//                     </span>
//                     <span style="display: flex; align-items: center; gap: 6px;">
//                         <i class="fas fa-clock"></i> 
//                         ${timeAgo}
//                     </span>
//                 </div>
//             </div>
//         `;
//     }

//     renderProfileHeader() {
//         // ✅ Récupération des données avec prénom/nom/bio
//         const firstName = this.userData.firstName || '';
//         const lastName = this.userData.lastName || '';
//         const displayName = `${firstName} ${lastName}`.trim() || 
//                            this.userData.displayName || 
//                            this.userData.email?.split('@')[0] || 
//                            'Unknown User';
        
//         const bio = this.userData.bio || 'No biography available';
//         const reputation = this.userData.reputation || 0;
//         const postCount = this.userData.postCount || 0;
//         const badges = this.userData.badges || [];
//         const followersCount = this.userData.followersCount || 0;
//         const followingCount = this.userData.followingCount || 0;

//         // ✅ CORRECTION : Photo de profil avec multiples fallbacks (comme post-manager.js)
//         const userAvatar = this.userData.photoURL || 
//                           this.userData.authorPhoto || 
//                           this.userData.avatar || 
//                           `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff&size=256`;

//         const avatarHTML = `
//             <img 
//                 src="${userAvatar}" 
//                 alt="${this.escapeHtml(displayName)}" 
//                 class="profile-avatar-large"
//                 style="width: 140px; height: 140px; border-radius: 50%; object-fit: cover; box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5); border: 5px solid rgba(255, 255, 255, 0.2);"
//                 onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff&size=256'"
//             >
//         `;

//         const badgesHTML = badges.map(badge => {
//             const badgeInfo = this.getBadgeInfo(badge);
//             return `
//                 <div class="profile-badge" style="padding: 10px 20px; border-radius: 12px; background: ${badgeInfo.gradient}; color: white; font-weight: 800; font-size: 0.9rem; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.2); margin-right: 12px; margin-bottom: 12px;">
//                     <i class="${badgeInfo.icon}"></i>
//                     <span>${badgeInfo.name}</span>
//                 </div>
//             `;
//         }).join('');

//         // ✅ Bouton Follow/Unfollow (masqué si propre profil)
//         const followButtonHTML = !this.isOwnProfile ? `
//             <button 
//                 id="followBtn" 
//                 class="create-post-btn" 
//                 onclick="window.publicProfile.toggleFollow()"
//                 style="margin-top: 24px; ${this.isFollowing ? 'background: linear-gradient(135deg, #6b7280, #4b5563);' : ''}"
//             >
//                 <i class="fas ${this.isFollowing ? 'fa-user-minus' : 'fa-user-plus'}"></i>
//                 ${this.isFollowing ? 'Unfollow' : 'Follow'}
//             </button>
//         ` : `
//             <a href="user-profile.html" class="create-post-btn" style="margin-top: 24px; text-decoration: none;">
//                 <i class="fas fa-edit"></i>
//                 Edit My Profile
//             </a>
//         `;

//         const profileHTML = `
//             <div style="display: flex; align-items: center; gap: 40px; flex-wrap: wrap;">
//                 ${avatarHTML}
//                 <div style="flex: 1; min-width: 300px;">
//                     <h1 class="profile-name" style="font-size: 2.8rem; font-weight: 900; margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
//                         <span class="gradient-title">${this.escapeHtml(displayName)}</span>
//                         ${badges.includes('verified-analyst') ? '<i class="fas fa-badge-check" style="color: #3B82F6; font-size: 2rem;"></i>' : ''}
//                     </h1>
//                     <p class="profile-bio" style="color: var(--text-secondary); font-size: 1.15rem; line-height: 1.7; margin-bottom: 28px; max-width: 600px;">
//                         ${this.escapeHtml(bio)}
//                     </p>
                    
//                     <div class="profile-stats" style="display: flex; gap: 32px; flex-wrap: wrap; margin-bottom: 24px;">
//                         <div class="profile-stat-item">
//                             <div class="profile-stat-value gradient-title" style="font-size: 2rem; font-weight: 900;">${reputation.toLocaleString()}</div>
//                             <div class="profile-stat-label" style="font-size: 0.9rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Reputation</div>
//                         </div>
//                         <div class="profile-stat-item">
//                             <div class="profile-stat-value gradient-title" style="font-size: 2rem; font-weight: 900;">${postCount}</div>
//                             <div class="profile-stat-label" style="font-size: 0.9rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Posts</div>
//                         </div>
//                         <div class="profile-stat-item">
//                             <div class="profile-stat-value gradient-title" style="font-size: 2rem; font-weight: 900;" id="followersCount">${followersCount}</div>
//                             <div class="profile-stat-label" style="font-size: 0.9rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Followers</div>
//                         </div>
//                         <div class="profile-stat-item">
//                             <div class="profile-stat-value gradient-title" style="font-size: 2rem; font-weight: 900;">${followingCount}</div>
//                             <div class="profile-stat-label" style="font-size: 0.9rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Following</div>
//                         </div>
//                         <div class="profile-stat-item">
//                             <div class="profile-stat-value gradient-title" style="font-size: 2rem; font-weight: 900;">${badges.length}</div>
//                             <div class="profile-stat-label" style="font-size: 0.9rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Badges</div>
//                         </div>
//                     </div>

//                     ${badges.length > 0 ? `<div class="profile-badges">${badgesHTML}</div>` : ''}
                    
//                     ${followButtonHTML}
//                 </div>
//             </div>
//         `;

//         document.getElementById('profileHeader').innerHTML = profileHTML;
//         document.title = `${displayName} - AlphaVault AI`;
//     }

//     async toggleFollow() {
//         try {
//             const followBtn = document.getElementById('followBtn');
//             const followersCountEl = document.getElementById('followersCount');
            
//             if (!followBtn) return;
            
//             // Désactiver le bouton pendant l'opération
//             followBtn.disabled = true;
//             const originalHTML = followBtn.innerHTML;
//             followBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

//             if (this.isFollowing) {
//                 // Unfollow
//                 await window.followSystem.unfollowUser(this.userId);
                
//                 // ✅ Mettre à jour l'état local (sera confirmé par le listener)
//                 this.isFollowing = false;
                
//                 // Mettre à jour le bouton
//                 followBtn.innerHTML = '<i class="fas fa-user-plus"></i> Follow';
//                 followBtn.style.background = '';
                
//                 // Décrémenter le compteur
//                 if (followersCountEl) {
//                     const currentCount = parseInt(followersCountEl.textContent) || 0;
//                     followersCountEl.textContent = Math.max(0, currentCount - 1);
//                 }
                
//                 console.log('✅ User unfollowed');
//             } else {
//                 // Follow
//                 await window.followSystem.followUser(this.userId);
                
//                 // ✅ Mettre à jour l'état local (sera confirmé par le listener)
//                 this.isFollowing = true;
                
//                 // Mettre à jour le bouton
//                 followBtn.innerHTML = '<i class="fas fa-user-minus"></i> Unfollow';
//                 followBtn.style.background = 'linear-gradient(135deg, #6b7280, #4b5563)';
                
//                 // Incrémenter le compteur
//                 if (followersCountEl) {
//                     const currentCount = parseInt(followersCountEl.textContent) || 0;
//                     followersCountEl.textContent = currentCount + 1;
//                 }
                
//                 console.log('✅ User followed');
//             }

//             // Réactiver le bouton
//             followBtn.disabled = false;

//         } catch (error) {
//             console.error('❌ Error toggling follow:', error);
            
//             // ✅ EN CAS D'ERREUR, RE-VÉRIFIER le statut réel
//             const currentUser = firebase.auth().currentUser;
//             if (currentUser) {
//                 this.isFollowing = await window.followSystem.isFollowing(this.userId);
//             }
            
//             // Restaurer le bouton avec le bon état
//             const followBtn = document.getElementById('followBtn');
//             if (followBtn) {
//                 followBtn.disabled = false;
//                 followBtn.innerHTML = this.isFollowing 
//                     ? '<i class="fas fa-user-minus"></i> Unfollow' 
//                     : '<i class="fas fa-user-plus"></i> Follow';
//                 followBtn.style.background = this.isFollowing 
//                     ? 'linear-gradient(135deg, #6b7280, #4b5563)' 
//                     : '';
//             }
            
//             alert('Failed to update follow status. Please try again.');
//         }
//     }

//     getBadgeInfo(badge) {
//         const badges = {
//             'verified-analyst': { name: 'Verified Analyst', icon: 'fas fa-badge-check', gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' },
//             'top-contributor': { name: 'Top Contributor', icon: 'fas fa-trophy', gradient: 'linear-gradient(135deg, #8B5CF6, #6366F1)' },
//             'platinum-member': { name: 'Platinum Member', icon: 'fas fa-star', gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)' },
//             'gold-member': { name: 'Gold Member', icon: 'fas fa-star', gradient: 'linear-gradient(135deg, #EAB308, #F59E0B)' },
//             'expert': { name: 'Expert', icon: 'fas fa-graduation-cap', gradient: 'linear-gradient(135deg, #10B981, #059669)' }
//         };
//         return badges[badge] || { name: badge, icon: 'fas fa-award', gradient: 'linear-gradient(135deg, #6b7280, #4b5563)' };
//     }

//     formatTimeAgo(date) {
//         if (!date) return 'Unknown';
//         const seconds = Math.floor((new Date() - date) / 1000);
//         const intervals = { year: 31536000, month: 2592000, week: 604800, day: 86400, hour: 3600, minute: 60 };
//         for (const [unit, secondsInUnit] of Object.entries(intervals)) {
//             const interval = Math.floor(seconds / secondsInUnit);
//             if (interval >= 1) return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
//         }
//         return 'Just now';
//     }

//     createExcerpt(content, maxLength) {
//         if (!content) return '';
//         const text = content.replace(/[#*`]/g, '').trim();
//         return text.length <= maxLength ? this.escapeHtml(text) : this.escapeHtml(text.substring(0, maxLength)) + '...';
//     }

//     escapeHtml(text) {
//         if (!text) return '';
//         const div = document.createElement('div');
//         div.textContent = text;
//         return div.innerHTML;
//     }

//     showError(message) {
//         const profileHeader = document.getElementById('profileHeader');
//         if (profileHeader) {
//             profileHeader.innerHTML = `
//                 <div style="text-align: center; padding: 60px; color: #EF4444; width: 100%;">
//                     <i class="fas fa-exclamation-triangle" style="font-size: 4rem; margin-bottom: 20px;"></i>
//                     <h3 style="font-size: 1.5rem; font-weight: 800;">${message}</h3>
//                     <button class="filter-btn" onclick="history.back()" style="margin-top: 24px;">
//                         <i class="fas fa-arrow-left"></i> Go Back
//                     </button>
//                 </div>
//             `;
//         }
//     }

//     // ✅ Nettoyer les listeners
//     cleanup() {
//         if (this.followUnsubscribe) {
//             this.followUnsubscribe();
//             console.log('🧹 Follow listener cleaned up');
//         }
//     }
// }

// // ✅ Initialiser au chargement de la page
// document.addEventListener('DOMContentLoaded', () => {
//     window.publicProfile = new PublicProfile();
//     window.publicProfile.initialize();
// });

// // ✅ Nettoyer lors du changement de page
// window.addEventListener('beforeunload', () => {
//     if (window.publicProfile) {
//         window.publicProfile.cleanup();
//     }
// });

// console.log('✅ public-profile.js chargé (v3.2 - FULLY CORRECTED)');

/* ============================================
   PUBLIC-PROFILE.JS - Profil Public v3.3
   ✅ CORRECTION TIMING : Attente de l'authentification
   ✅ CORRECTION : Listener temps réel persistant
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
        
        // Listener unsubscribe
        this.followUnsubscribe = null;
        this.authUnsubscribe = null;
    }

    async initialize() {
        try {
            console.log('👤 Initializing Public Profile...');
            
            const urlParams = new URLSearchParams(window.location.search);
            this.userId = urlParams.get('id');

            if (!this.userId) {
                this.showError('User not found');
                return;
            }

            // ✅ CORRECTION CRITIQUE : Attendre l'authentification complète
            console.log('⏳ Waiting for authentication...');
            const currentUser = await this.waitForAuth();
            
            if (currentUser) {
                console.log('✅ Authenticated as:', currentUser.email, '(UID:', currentUser.uid + ')');
            } else {
                console.log('⚠ No authenticated user');
            }

            // Vérifier si c'est son propre profil
            this.isOwnProfile = currentUser && currentUser.uid === this.userId;
            console.log('🔍 Is own profile?', this.isOwnProfile);

            // ✅ Charger les données utilisateur
            await this.loadUserData();
            
            // ✅ CORRECTION : Vérifier le statut de suivi AVEC LOGS DÉTAILLÉS
            if (!this.isOwnProfile && currentUser) {
                console.log('🔍 Vérification du statut de suivi...');
                console.log('   - Current user UID:', currentUser.uid);
                console.log('   - Profile user UID:', this.userId);
                
                // Vérifier que followSystem existe
                if (!window.followSystem) {
                    console.error('❌ window.followSystem is not defined!');
                    console.error('   Make sure follow-system.js is loaded BEFORE public-profile.js');
                } else {
                    console.log('✅ window.followSystem is available');
                    
                    try {
                        this.isFollowing = await window.followSystem.isFollowing(this.userId);
                        console.log('✅ Statut de suivi confirmé:', this.isFollowing);
                        
                        // ✅ Mettre en place le listener temps réel
                        this.setupFollowListener();
                    } catch (error) {
                        console.error('❌ Error checking follow status:', error);
                        this.isFollowing = false;
                    }
                }
            } else {
                console.log('ℹ Skipping follow check:', {
                    isOwnProfile: this.isOwnProfile,
                    hasCurrentUser: !!currentUser
                });
            }
            
            // ✅ Rendre le header avec le statut correct
            this.renderProfileHeader();
            
            // Charger toutes les activités
            await this.loadAllActivities();
            
            console.log('✅ Public Profile initialized');
        } catch (error) {
            console.error('❌ Error initializing profile:', error);
            this.showError('Failed to load profile');
        }
    }

    // ✅ NOUVELLE MÉTHODE : Attendre l'authentification
    waitForAuth() {
        return new Promise((resolve) => {
            // Si déjà authentifié, résoudre immédiatement
            const currentUser = firebase.auth().currentUser;
            if (currentUser) {
                console.log('✅ User already authenticated');
                resolve(currentUser);
                return;
            }

            // Sinon, attendre le changement d'état d'authentification
            console.log('⏳ Waiting for auth state change...');
            this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
                if (this.authUnsubscribe) {
                    this.authUnsubscribe(); // Se désabonner immédiatement
                    this.authUnsubscribe = null;
                }
                console.log('🔔 Auth state changed:', user ? user.email : 'No user');
                resolve(user);
            });
        });
    }

    // ✅ CORRECTION : Listener temps réel avec logs détaillés
    setupFollowListener() {
        const currentUser = firebase.auth().currentUser;
        if (!currentUser || this.isOwnProfile) {
            console.log('⚠ Skipping follow listener setup:', {
                hasCurrentUser: !!currentUser,
                isOwnProfile: this.isOwnProfile
            });
            return;
        }
        
        console.log('👂 Setting up follow status listener...');
        console.log('   - Listening to: users/' + currentUser.uid + '/following/' + this.userId);
        
        // Écouter les changements dans la sous-collection "following"
        this.followUnsubscribe = firebase.firestore()
            .collection('users')
            .doc(currentUser.uid)
            .collection('following')
            .doc(this.userId)
            .onSnapshot((doc) => {
                const newFollowStatus = doc.exists;
                
                console.log('🔔 Follow status update from Firestore:', {
                    docPath: doc.ref.path,
                    docExists: doc.exists,
                    docData: doc.data(),
                    previousStatus: this.isFollowing,
                    newStatus: newFollowStatus
                });
                
                // Mettre à jour le statut
                const statusChanged = this.isFollowing !== newFollowStatus;
                this.isFollowing = newFollowStatus;
                
                // Mettre à jour le bouton
                this.updateFollowButton();
                
                if (statusChanged) {
                    console.log('✅ Follow status CHANGED:', this.isFollowing);
                } else {
                    console.log('ℹ Follow status unchanged:', this.isFollowing);
                }
            }, (error) => {
                console.error('❌ Error in follow listener:', error);
            });
    }

    // ✅ Mettre à jour uniquement le bouton Follow
    updateFollowButton() {
        const followBtn = document.getElementById('followBtn');
        
        if (!followBtn) {
            console.warn('⚠ Follow button not found in DOM');
            return;
        }
        
        console.log('🔄 Updating follow button UI, isFollowing:', this.isFollowing);
        
        if (this.isFollowing) {
            followBtn.innerHTML = '<i class="fas fa-user-minus"></i> Unfollow';
            followBtn.style.background = 'linear-gradient(135deg, #6b7280, #4b5563)';
        } else {
            followBtn.innerHTML = '<i class="fas fa-user-plus"></i> Follow';
            followBtn.style.background = '';
        }
        
        followBtn.disabled = false;
    }

    async loadUserData() {
        console.log('📥 Loading user data for:', this.userId);
        
        const userDoc = await firebase.firestore()
            .collection('users')
            .doc(this.userId)
            .get();

        if (!userDoc.exists) {
            throw new Error('User not found');
        }

        this.userData = { uid: this.userId, ...userDoc.data() };
        console.log('✅ User data loaded:', this.userData);
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
                .collection('posts')
                .where('authorId', '==', this.userId)
                .orderBy('createdAt', 'desc')
                .limit(50)
                .get();

            this.userPosts = snapshot.docs.map(doc => {
                const postData = doc.data();
                return {
                    id: doc.id,
                    ...postData,
                    createdAt: postData.createdAt?.toDate()
                };
            });

            const countEl = document.getElementById('postsTabCount');
            if (countEl) countEl.textContent = this.userPosts.length;
            
            console.log(`✅ ${this.userPosts.length} posts chargés`);
        } catch (error) {
            console.error('❌ Error loading user posts:', error);
            this.userPosts = [];
            const countEl = document.getElementById('postsTabCount');
            if (countEl) countEl.textContent = '0';
        }
    }

    // ✅ CHARGER LES POSTS LIKÉS
    async loadLikedPosts() {
        try {
            console.log('📥 Loading liked posts for user:', this.userId);
            
            // ✅ Vérifier que la collection existe
            const likesRef = firebase.firestore()
                .collection('users')
                .doc(this.userId)
                .collection('likedPosts');
            
            console.log('📂 Likes collection path:', likesRef.path);
            
            const likesSnapshot = await likesRef
                .orderBy('likedAt', 'desc')
                .limit(50)
                .get();

            console.log('📊 Liked posts snapshot:', {
                empty: likesSnapshot.empty,
                size: likesSnapshot.size,
                docs: likesSnapshot.docs.length
            });

            if (likesSnapshot.empty) {
                console.warn('⚠ No liked posts found in subcollection users/' + this.userId + '/likedPosts');
                console.warn('💡 Verify that likes are correctly saved to this subcollection');
                this.likedPosts = [];
                const countEl = document.getElementById('likedTabCount');
                if (countEl) countEl.textContent = '0';
                return;
            }

            const postIds = likesSnapshot.docs.map(doc => {
                const data = doc.data();
                console.log('   ✓ Liked post:', {
                    postId: doc.id,
                    likedAt: data.likedAt?.toDate(),
                    data: data
                });
                return doc.id;
            });
            
            console.log('📋 Total post IDs to fetch:', postIds.length);

            const batchSize = 10;
            const batches = [];
            
            for (let i = 0; i < postIds.length; i += batchSize) {
                const batchIds = postIds.slice(i, i + batchSize);
                console.log(`📦 Fetching batch ${Math.floor(i/batchSize) + 1}:`, batchIds);
                
                const batchSnapshot = await firebase.firestore()
                    .collection('posts')
                    .where(firebase.firestore.FieldPath.documentId(), 'in', batchIds)
                    .get();
                
                console.log(`   ✓ Batch ${Math.floor(i/batchSize) + 1} fetched:`, batchSnapshot.size, 'posts');
                batches.push(...batchSnapshot.docs);
            }

            this.likedPosts = batches.map(doc => {
                if (!doc.exists) {
                    console.warn('⚠ Post not found:', doc.id);
                    return null;
                }
                const postData = doc.data();
                return {
                    id: doc.id,
                    ...postData,
                    createdAt: postData.createdAt?.toDate()
                };
            }).filter(post => post !== null);

            const countEl = document.getElementById('likedTabCount');
            if (countEl) countEl.textContent = this.likedPosts.length;
            
            console.log(`✅ ${this.likedPosts.length} liked posts loaded successfully`);
            console.log('📊 Liked posts:', this.likedPosts.map(p => ({ id: p.id, title: p.title })));
            
        } catch (error) {
            console.error('❌ Error loading liked posts:', error);
            console.error('❌ Error details:', {
                code: error.code,
                message: error.message,
                userId: this.userId
            });
            this.likedPosts = [];
            const countEl = document.getElementById('likedTabCount');
            if (countEl) countEl.textContent = '0';
        }
    }

    // ✅ CHARGER LES POSTS COMMENTÉS
    async loadCommentedPosts() {
        try {
            const commentsSnapshot = await firebase.firestore()
                .collection('comments')
                .where('authorId', '==', this.userId)
                .orderBy('createdAt', 'desc')
                .limit(100)
                .get();

            if (commentsSnapshot.empty) {
                this.commentedPosts = [];
                const countEl = document.getElementById('commentedTabCount');
                if (countEl) countEl.textContent = '0';
                return;
            }

            const postIdsSet = new Set();
            commentsSnapshot.docs.forEach(doc => {
                const comment = doc.data();
                if (comment.postId) {
                    postIdsSet.add(comment.postId);
                }
            });

            const postIds = Array.from(postIdsSet);

            if (postIds.length === 0) {
                this.commentedPosts = [];
                const countEl = document.getElementById('commentedTabCount');
                if (countEl) countEl.textContent = '0';
                return;
            }

            const batchSize = 10;
            const batches = [];
            
            for (let i = 0; i < postIds.length; i += batchSize) {
                const batchIds = postIds.slice(i, i + batchSize);
                const batchSnapshot = await firebase.firestore()
                    .collection('posts')
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

            const countEl = document.getElementById('commentedTabCount');
            if (countEl) countEl.textContent = this.commentedPosts.length;
            
            console.log(`✅ ${this.commentedPosts.length} posts commentés chargés`);
        } catch (error) {
            console.error('❌ Error loading commented posts:', error);
            this.commentedPosts = [];
            const countEl = document.getElementById('commentedTabCount');
            if (countEl) countEl.textContent = '0';
        }
    }

    // ✅ CHANGER D'ONGLET
    switchTab(tabName) {
        this.currentTab = tabName;
        
        document.querySelectorAll('[data-tab]').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });
        
        this.renderTabContent();
    }

    renderTabContent() {
        const activityContent = document.getElementById('activityContent');
        if (!activityContent) return;
        
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
                        <i class="fas fa-heart" style="color: #EF4444;"></i> 
                        ${post.likes?.length || 0}
                    </span>
                    <span style="display: flex; align-items: center; gap: 6px;">
                        <i class="fas fa-comment" style="color: #3B82F6;"></i> 
                        ${post.commentsCount || 0}
                    </span>
                    <span style="display: flex; align-items: center; gap: 6px;">
                        <i class="fas fa-eye" style="color: #8B5CF6;"></i> 
                        ${post.views || 0}
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

        const userAvatar = this.userData.photoURL || 
                          this.userData.authorPhoto || 
                          this.userData.avatar || 
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff&size=256`;

        const avatarHTML = `
            <img 
                src="${userAvatar}" 
                alt="${this.escapeHtml(displayName)}" 
                class="profile-avatar-large"
                style="width: 140px; height: 140px; border-radius: 50%; object-fit: cover; box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5); border: 5px solid rgba(255, 255, 255, 0.2);"
                onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff&size=256'"
            >
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

        const profileHeaderEl = document.getElementById('profileHeader');
        if (profileHeaderEl) {
            profileHeaderEl.innerHTML = profileHTML;
        }
        
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
                
                if (followersCountEl) {
                    const currentCount = parseInt(followersCountEl.textContent) || 0;
                    followersCountEl.textContent = Math.max(0, currentCount - 1);
                }
                
                console.log('✅ User unfollowed');
            } else {
                await window.followSystem.followUser(this.userId);
                this.isFollowing = true;
                
                if (followersCountEl) {
                    const currentCount = parseInt(followersCountEl.textContent) || 0;
                    followersCountEl.textContent = currentCount + 1;
                }
                
                console.log('✅ User followed');
            }

            this.updateFollowButton();

        } catch (error) {
            console.error('❌ Error toggling follow:', error);
            
            const currentUser = firebase.auth().currentUser;
            if (currentUser) {
                this.isFollowing = await window.followSystem.isFollowing(this.userId);
            }
            
            this.updateFollowButton();
            alert('Failed to update follow status. Please try again.');
        }
    }

    getBadgeInfo(badge) {
        const badges = {
            'verified-analyst': { name: 'Verified Analyst', icon: 'fas fa-badge-check', gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' },
            'top-contributor': { name: 'Top Contributor', icon: 'fas fa-trophy', gradient: 'linear-gradient(135deg, #8B5CF6, #6366F1)' },
            'platinum-member': { name: 'Platinum Member', icon: 'fas fa-star', gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)' },
            'gold-member': { name: 'Gold Member', icon: 'fas fa-star', gradient: 'linear-gradient(135deg, #EAB308, #F59E0B)' },
            'expert': { name: 'Expert', icon: 'fas fa-graduation-cap', gradient: 'linear-gradient(135deg, #10B981, #059669)' }
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
        if (!content) return '';
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
        const profileHeader = document.getElementById('profileHeader');
        if (profileHeader) {
            profileHeader.innerHTML = `
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

    cleanup() {
        if (this.followUnsubscribe) {
            this.followUnsubscribe();
            console.log('🧹 Follow listener cleaned up');
        }
        if (this.authUnsubscribe) {
            this.authUnsubscribe();
            console.log('🧹 Auth listener cleaned up');
        }
    }
}

// ✅ Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    window.publicProfile = new PublicProfile();
    window.publicProfile.initialize();
});

// ✅ Nettoyer lors du changement de page
window.addEventListener('beforeunload', () => {
    if (window.publicProfile) {
        window.publicProfile.cleanup();
    }
});

console.log('✅ public-profile.js chargé (v3.3 - AUTH TIMING FIXED)');