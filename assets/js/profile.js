/* ============================================
   PROFILE.JS - Gestion de la page profil v4.5
   ✅ SCROLLBAR VISIBLE SUR PC
   ✅ ÉLÉMENTS CENTRÉS SUR MOBILE
   ✅ SANS DUPLICATION
   ✅ AUTO-CHARGEMENT SI PAS DE SCROLL
   ============================================ */


// Configuration
const WORKER_URL = 'https://finance-hub-api.raphnardone.workers.dev';

// Variables globales
let currentUserData = null;
let isEditingPersonalInfo = false;

// ============================================
// 🆕 SYSTÈME D'INFINITE SCROLL SANS DUPLICATION
// ============================================

class InfiniteScrollManager {
    constructor(listId, loadFunction, itemsPerPage = 10) {
        this.listId = listId;
        this.loadFunction = loadFunction;
        this.itemsPerPage = itemsPerPage;
        this.lastVisible = null;
        this.isLoading = false;
        this.hasMore = true;
        this.loadedIds = new Set();
        this.observer = null;
        this.container = null;
        this.sentinel = null;
        this.loadMoreDebounce = null;
    }

    init() {
        this.container = document.getElementById(this.listId);
        if (!this.container) {
            console.error(`❌ Container ${this.listId} not found`);
            return;
        }

        const isMobile = window.innerWidth <= 768;
        
        // ✅ CORRECTION : Hauteurs optimisées pour forcer le scroll
        const maxHeight = isMobile ? '280px' : '320px'; // ✅ Réduit pour forcer le scroll
        
        this.container.style.setProperty('max-height', maxHeight, 'important');
        this.container.style.setProperty('overflow-y', 'scroll', 'important');
        this.container.style.setProperty('overflow-x', 'hidden', 'important');
        this.container.style.setProperty('position', 'relative', 'important');
        this.container.style.setProperty('padding-right', '8px', 'important');
        this.container.style.setProperty('scrollbar-gutter', 'stable', 'important');
        
        // Vider complètement le container
        this.container.innerHTML = '';

        // Créer le sentinel
        this.sentinel = document.createElement('div');
        this.sentinel.id = `${this.listId}-sentinel`;
        this.sentinel.style.cssText = 'height: 1px; width: 100%; pointer-events: none;';
        this.container.appendChild(this.sentinel);

        // Observer le sentinel
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.isLoading && this.hasMore) {
                        clearTimeout(this.loadMoreDebounce);
                        this.loadMoreDebounce = setTimeout(() => {
                            this.loadMore();
                        }, 100);
                    }
                });
            },
            { 
                root: this.container,
                threshold: 0,
                rootMargin: '50px'
            }
        );

        this.observer.observe(this.sentinel);

        console.log(`✅ Infinite Scroll initialized for ${this.listId} (max-height: ${maxHeight})`);
    }

    // ✅ NOUVELLE MÉTHODE : Auto-chargement si pas de scroll
    async checkAndLoadMore() {
        if (!this.container) return;
        
        const hasScroll = this.container.scrollHeight > this.container.clientHeight;
        
        console.log(`📏 ${this.listId} - Scroll check:`, {
            scrollHeight: this.container.scrollHeight,
            clientHeight: this.container.clientHeight,
            hasScroll: hasScroll,
            loadedItems: this.loadedIds.size,
            hasMore: this.hasMore
        });
        
        // ✅ Si pas de scroll et qu'il reste des items, charger automatiquement
        if (!hasScroll && this.hasMore && !this.isLoading) {
            console.log(`🔄 ${this.listId} - No scroll detected, auto-loading more items...`);
            await this.loadMore();
            
            // ✅ Re-vérifier après chargement
            setTimeout(() => this.checkAndLoadMore(), 300);
        }
    }

    async loadMore() {
        if (this.isLoading || !this.hasMore) {
            console.log(`⏸ ${this.listId}: Skip loading (isLoading: ${this.isLoading}, hasMore: ${this.hasMore})`);
            return;
        }

        this.isLoading = true;
        this.showLoader();

        try {
            console.log(`📥 Loading batch for ${this.listId}... (Already loaded: ${this.loadedIds.size})`);
            
            const result = await this.loadFunction(this.lastVisible, this.itemsPerPage);
            
            console.log(`✅ Received ${result.items.length} items for ${this.listId}`);

            const newItems = [];
            for (const item of result.items) {
                const id = item.uid || item.postId;
                
                if (!id) {
                    console.warn('⚠ Item without ID:', item);
                    continue;
                }
                
                if (this.loadedIds.has(id)) {
                    console.log(`🔄 Duplicate detected and skipped: ${id}`);
                    continue;
                }
                
                this.loadedIds.add(id);
                newItems.push(item);
            }

            console.log(`✅ ${newItems.length} new items after strict deduplication (Total loaded: ${this.loadedIds.size})`);

            if (newItems.length > 0) {
                this.render(newItems);
                
                // ✅ NOUVEAU : Vérifier si on doit charger plus d'items
                setTimeout(() => this.checkAndLoadMore(), 200);
            }

            if (result.items.length < this.itemsPerPage) {
                this.hasMore = false;
                this.showEndMessage();
                console.log(`✅ ${this.listId}: No more items to load`);
            }

            this.lastVisible = result.lastVisible;

        } catch (error) {
            console.error(`❌ Error loading more items for ${this.listId}:`, error);
            this.showError(error.message);
        } finally {
            this.isLoading = false;
            this.hideLoader();
        }
    }

    showLoader() {
        const existingLoader = document.getElementById(`${this.listId}-loader`);
        if (existingLoader) return;

        const loader = document.createElement('div');
        loader.id = `${this.listId}-loader`;
        loader.style.cssText = 'text-align: center; padding: 24px; color: var(--text-secondary);';
        loader.innerHTML = `
            <i class="fas fa-spinner fa-spin" style="font-size: 1.5rem; color: var(--primary);"></i>
            <p style="margin-top: 12px; font-size: 0.9rem;">Loading more...</p>
        `;
        
        this.container.insertBefore(loader, this.sentinel);
    }

    hideLoader() {
        const loader = document.getElementById(`${this.listId}-loader`);
        if (loader) {
            loader.remove();
        }
    }

    showEndMessage() {
        const existingEnd = document.getElementById(`${this.listId}-end`);
        if (existingEnd) return;

        const endMsg = document.createElement('div');
        endMsg.id = `${this.listId}-end`;
        endMsg.style.cssText = 'text-align: center; padding: 20px; color: var(--text-secondary); font-size: 0.9rem;';
        endMsg.innerHTML = `<i class="fas fa-check-circle"></i> All items loaded`;
        
        this.container.insertBefore(endMsg, this.sentinel);
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'text-align: center; padding: 20px; color: #EF4444;';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
        `;
        this.container.insertBefore(errorDiv, this.sentinel);
    }

    render(newItems) {
        console.warn('⚠ render() should be overridden');
    }

    reset() {
        console.log(`🔄 Resetting ${this.listId}...`);
        
        this.loadedIds.clear();
        this.lastVisible = null;
        this.hasMore = true;
        this.isLoading = false;
        
        if (this.container) {
            this.container.innerHTML = '';
            
            this.sentinel = document.createElement('div');
            this.sentinel.id = `${this.listId}-sentinel`;
            this.sentinel.style.cssText = 'height: 1px; width: 100%; pointer-events: none;';
            this.container.appendChild(this.sentinel);
            
            if (this.observer) {
                this.observer.observe(this.sentinel);
            }
        }

        console.log(`✅ ${this.listId} reset complete`);
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        clearTimeout(this.loadMoreDebounce);
        console.log(`🗑 ${this.listId} destroyed`);
    }
}

// Instances globales
let followingScrollManager = null;
let followersScrollManager = null;
let savedPostsScrollManager = null;

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initialisation de la page profil...');
    
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase non initialisé !');
        showToast('error', 'Erreur', 'Impossible de charger Firebase');
        return;
    }
    
    addCustomScrollbarStyles();
    addResponsiveStyles();
    
    initializeEventListeners();
    
    console.log('✅ Page profil initialisée');
});

window.addEventListener('userDataLoaded', (e) => {
    currentUserData = e.detail;
    console.log('✅ Données utilisateur reçues:', currentUserData);
    
    loadUserData(currentUserData);
    initInfiniteScroll();
});

window.addEventListener('resize', () => {
    const isMobile = window.innerWidth <= 768;
    const maxHeight = isMobile ? '280px' : '320px';
    
    ['followingList', 'followersList', 'savedPostsList'].forEach(listId => {
        const container = document.getElementById(listId);
        if (container) {
            container.style.maxHeight = maxHeight;
        }
    });
});

function addCustomScrollbarStyles() {
    const oldStyle = document.getElementById('custom-scrollbar-styles');
    if (oldStyle) oldStyle.remove();
    
    const style = document.createElement('style');
    style.id = 'custom-scrollbar-styles';
    style.textContent = `
        /* ✅ FORCER LA SCROLLBAR VISIBLE SUR PC */
        #followingList,
        #followersList,
        #savedPostsList {
            overflow-y: scroll !important; /* ✅ Force scroll visible */
            overflow-x: hidden !important;
            scrollbar-gutter: stable; /* ✅ Réserve l'espace pour la scrollbar */
        }
        
        /* Scrollbar Webkit (Chrome, Edge, Safari) */
        #followingList::-webkit-scrollbar,
        #followersList::-webkit-scrollbar,
        #savedPostsList::-webkit-scrollbar {
            width: 14px !important; /* ✅ Largeur augmentée */
            height: 14px !important;
        }
        
        #followingList::-webkit-scrollbar-track,
        #followersList::-webkit-scrollbar-track,
        #savedPostsList::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.08);
            border-radius: 10px;
            margin: 4px 0;
        }
        
        #followingList::-webkit-scrollbar-thumb,
        #followersList::-webkit-scrollbar-thumb,
        #savedPostsList::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 10px;
            border: 3px solid transparent;
            background-clip: padding-box;
            min-height: 60px !important; /* ✅ Hauteur minimale augmentée */
            transition: background 0.3s ease;
        }
        
        #followingList::-webkit-scrollbar-thumb:hover,
        #followersList::-webkit-scrollbar-thumb:hover,
        #savedPostsList::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #764ba2, #667eea);
            background-clip: padding-box;
        }
        
        #followingList::-webkit-scrollbar-thumb:active,
        #followersList::-webkit-scrollbar-thumb:active,
        #savedPostsList::-webkit-scrollbar-thumb:active {
            background: linear-gradient(135deg, #5a67d8, #6b46c1);
            background-clip: padding-box;
        }
        
        /* Firefox */
        #followingList,
        #followersList,
        #savedPostsList {
            scrollbar-width: thin !important;
            scrollbar-color: #667eea rgba(0, 0, 0, 0.08) !important;
        }
        
        /* Dark mode */
        body.dark-mode #followingList::-webkit-scrollbar-track,
        body.dark-mode #followersList::-webkit-scrollbar-track,
        body.dark-mode #savedPostsList::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.08);
        }
        
        body.dark-mode #followingList,
        body.dark-mode #followersList,
        body.dark-mode #savedPostsList {
            scrollbar-color: #667eea rgba(255, 255, 255, 0.08) !important;
        }
    `;
    document.head.appendChild(style);
    
    console.log('✅ Scrollbar styles applied (forced visible)');
}

// ============================================
// 🆕 STYLES RESPONSIVE MOBILE (CENTRAGE UNIQUEMENT SUR MOBILE)
// ============================================

function addResponsiveStyles() {
    const style = document.createElement('style');
    style.id = 'profile-responsive-styles';
    style.textContent = `
        /* ===== DESKTOP : PAS DE CENTRAGE (Layout horizontal normal) ===== */
        @media (min-width: 769px) {
            .following-item,
            .follower-item,
            .saved-post-item {
                display: flex !important;
                flex-direction: row !important;
                align-items: center !important;
                text-align: left !important;
            }
            
            .following-item > div,
            .follower-item > div,
            .saved-post-item > div {
                text-align: left !important;
            }
        }
        
        /* ===== MOBILE : CENTRAGE ACTIVÉ ===== */
        @media (max-width: 768px) {
            /* ✅ CENTRAGE DES WRAPPERS */
            .following-item-wrapper,
            .follower-item-wrapper,
            .saved-post-item-wrapper {
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            /* ✅ CENTRAGE DES CARDS */
            .following-item,
            .follower-item,
            .saved-post-item {
                flex-direction: column !important;
                align-items: center !important;
                text-align: center !important;
                padding: 20px !important;
                gap: 16px !important;
                width: 100% !important;
                max-width: 100% !important;
            }
            
            /* ✅ CENTRAGE DES CONTENUS */
            .following-item > div,
            .follower-item > div,
            .saved-post-item > div {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                text-align: center !important;
                width: 100% !important;
            }
            
            /* Avatars centrés */
            .following-item img,
            .follower-item img {
                width: 60px !important;
                height: 60px !important;
                margin: 0 auto !important;
            }
            
            /* Images de posts centrées */
            .saved-post-item img {
                width: 100px !important;
                height: 100px !important;
                margin: 0 auto !important;
            }
            
            /* Titres centrés */
            .following-item h4,
            .follower-item h4,
            .saved-post-item h4 {
                font-size: 1.1rem !important;
                text-align: center !important;
                width: 100% !important;
            }
            
            /* Paragraphes centrés */
            .following-item p,
            .follower-item p,
            .saved-post-item p {
                font-size: 0.9rem !important;
                text-align: center !important;
                white-space: normal !important;
                width: 100% !important;
            }
            
            /* Stats centrées */
            .following-item > div > div,
            .follower-item > div > div,
            .saved-post-item > div > div {
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                flex-wrap: wrap !important;
                gap: 12px !important;
                width: 100% !important;
            }
            
            /* Boutons centrés et pleine largeur */
            .following-item button,
            .follower-item button,
            .saved-post-item button {
                width: 100% !important;
                max-width: 280px !important;
                padding: 12px 24px !important;
                font-size: 0.95rem !important;
                margin: 0 auto !important;
            }
        }
        
        @media (max-width: 480px) {
            /* Hauteur réduite sur très petits écrans */
            #followingList,
            #followersList,
            #savedPostsList {
                max-height: 280px !important;
            }
            
            /* Avatars plus petits */
            .following-item img,
            .follower-item img {
                width: 50px !important;
                height: 50px !important;
            }
            
            .saved-post-item img {
                width: 80px !important;
                height: 80px !important;
            }
            
            /* Padding réduit */
            .following-item,
            .follower-item,
            .saved-post-item {
                padding: 16px !important;
            }
            
            /* Titres plus petits */
            .following-item h4,
            .follower-item h4,
            .saved-post-item h4 {
                font-size: 1rem !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// 🆕 INITIALISATION INFINITE SCROLL
// ============================================

function initInfiniteScroll() {
    console.log('🔄 Initializing infinite scroll managers...');

    if (followingScrollManager) followingScrollManager.destroy();
    if (followersScrollManager) followersScrollManager.destroy();
    if (savedPostsScrollManager) savedPostsScrollManager.destroy();

    // ✅ CORRECTION : itemsPerPage augmenté de 4 → 10
    followingScrollManager = new InfiniteScrollManager('followingList', loadFollowingBatch, 10);
    followingScrollManager.render = renderFollowingItems;
    followingScrollManager.init();

    followersScrollManager = new InfiniteScrollManager('followersList', loadFollowersBatch, 10);
    followersScrollManager.render = renderFollowersItems;
    followersScrollManager.init();

    savedPostsScrollManager = new InfiniteScrollManager('savedPostsList', loadSavedPostsBatch, 10);
    savedPostsScrollManager.render = renderSavedPostsItems;
    savedPostsScrollManager.init();

    console.log('✅ All infinite scroll managers initialized');
}

// ============================================
// 🆕 CHARGEMENT PAR BATCH - FOLLOWING
// ============================================

async function loadFollowingBatch(lastVisible, limit) {
    if (!currentUserData || !currentUserData.uid) {
        throw new Error('No user data');
    }

    console.log(`📥 Loading following batch (limit: ${limit}, lastVisible: ${lastVisible ? 'yes' : 'no'})...`);

    let query = firebase.firestore()
        .collection('users')
        .doc(currentUserData.uid)
        .collection('following')
        .orderBy('followedAt', 'desc')
        .limit(limit);

    if (lastVisible) {
        query = query.startAfter(lastVisible);
    }

    const snapshot = await query.get();

    console.log(`✅ Following snapshot size: ${snapshot.size}`);
    console.log(`📊 Total documents in query:`, snapshot.docs.map(d => d.id)); // ✅ DIAGNOSTIC

    const items = await Promise.all(
        snapshot.docs.map(async (doc) => {
            const followedUserId = doc.id;
            const followedAt = doc.data().followedAt;
            
            try {
                const userDoc = await firebase.firestore()
                    .collection('users')
                    .doc(followedUserId)
                    .get();
                
                if (!userDoc.exists) return null;
                
                return {
                    uid: followedUserId,
                    ...userDoc.data(),
                    followedAt: followedAt
                };
            } catch (error) {
                console.warn(`⚠ Could not load user ${followedUserId}:`, error);
                return null;
            }
        })
    );

    const validItems = items.filter(item => item !== null);

    if (!lastVisible) {
        const totalSnapshot = await firebase.firestore()
            .collection('users')
            .doc(currentUserData.uid)
            .collection('following')
            .get();
        
        const followingCountEl = document.getElementById('followingCount');
        if (followingCountEl) {
            followingCountEl.textContent = totalSnapshot.size;
        }
    }

    return {
        items: validItems,
        lastVisible: snapshot.docs[snapshot.docs.length - 1]
    };
}

function renderFollowingItems(newItems) {
    if (newItems.length === 0) return;

    newItems.forEach((user) => {
        const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 
                           user.email?.split('@')[0] || 'Unknown User';
        const avatar = user.photoURL || 
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff&size=128`;
        const bio = user.bio || 'No biography';

        const itemDiv = document.createElement('div');
        itemDiv.className = 'following-item-wrapper';
        itemDiv.style.marginBottom = '16px';
        itemDiv.setAttribute('data-user-id', user.uid);
        itemDiv.innerHTML = `
            <div class="following-item" style="display: flex; align-items: center; gap: 16px; padding: 16px; background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: 12px; transition: all 0.3s ease;">
                <img 
                    src="${avatar}" 
                    alt="${escapeHtml(displayName)}" 
                    style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 3px solid rgba(59, 130, 246, 0.3); cursor: pointer; flex-shrink: 0;"
                    onclick="window.location.href='public-profile.html?id=${user.uid}'"
                    onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff&size=128'"
                >
                <div style="flex: 1; min-width: 0; cursor: pointer;" onclick="window.location.href='public-profile.html?id=${user.uid}'">
                    <h4 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 4px; color: var(--text-primary);">
                        ${escapeHtml(displayName)}
                    </h4>
                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${escapeHtml(bio)}
                    </p>
                    <div style="display: flex; gap: 16px; font-size: 0.85rem; color: var(--text-secondary);">
                        <span><i class="fas fa-file-alt"></i> ${user.postCount || 0} posts</span>
                        <span><i class="fas fa-users"></i> ${user.followersCount || 0} followers</span>
                    </div>
                </div>
                <button 
                    class="btn-danger" 
                    onclick="unfollowUser('${user.uid}')"
                    style="padding: 10px 20px; white-space: nowrap; flex-shrink: 0;"
                >
                    <i class="fas fa-user-minus"></i>
                    Unfollow
                </button>
            </div>
        `;

        followingScrollManager.container.insertBefore(itemDiv, followingScrollManager.sentinel);
    });

    if (followingScrollManager.loadedIds.size === 0 && !followingScrollManager.hasMore) {
        followingScrollManager.container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <i class="fas fa-user-friends" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.5;"></i>
                <p style="font-size: 1.1rem; font-weight: 700;">You're not following anyone yet</p>
                <p style="font-size: 0.9rem; margin-top: 8px;">Discover interesting profiles in the Community!</p>
                <a href="community-hub.html" class="btn-save" style="margin-top: 20px; display: inline-flex; text-decoration: none;">
                    <i class="fas fa-users"></i>
                    Explore Community
                </a>
            </div>
        `;
    }
}

// ============================================
// 🆕 CHARGEMENT PAR BATCH - FOLLOWERS
// ============================================

async function loadFollowersBatch(lastVisible, limit) {
    if (!currentUserData || !currentUserData.uid) {
        throw new Error('No user data');
    }

    console.log(`📥 Loading followers batch (limit: ${limit}, lastVisible: ${lastVisible ? 'yes' : 'no'})...`);

    let query = firebase.firestore()
        .collection('users')
        .doc(currentUserData.uid)
        .collection('followers')
        .orderBy('followedAt', 'desc')
        .limit(limit);

    if (lastVisible) {
        query = query.startAfter(lastVisible);
    }

    const snapshot = await query.get();

    console.log(`✅ Followers snapshot size: ${snapshot.size}`);
    console.log(`📊 Total documents in query:`, snapshot.docs.map(d => d.id)); // ✅ DIAGNOSTIC

    const items = await Promise.all(
        snapshot.docs.map(async (doc) => {
            const followerId = doc.id;
            const followedAt = doc.data().followedAt;
            
            try {
                const userDoc = await firebase.firestore()
                    .collection('users')
                    .doc(followerId)
                    .get();
                
                if (!userDoc.exists) return null;
                
                return {
                    uid: followerId,
                    ...userDoc.data(),
                    followedAt: followedAt
                };
            } catch (error) {
                console.warn(`⚠ Could not load user ${followerId}:`, error);
                return null;
            }
        })
    );

    const validItems = items.filter(item => item !== null);

    if (!lastVisible) {
        const totalSnapshot = await firebase.firestore()
            .collection('users')
            .doc(currentUserData.uid)
            .collection('followers')
            .get();
        
        const followersCountEl = document.getElementById('followersCount');
        if (followersCountEl) {
            followersCountEl.textContent = totalSnapshot.size;
        }
    }

    return {
        items: validItems,
        lastVisible: snapshot.docs[snapshot.docs.length - 1]
    };
}

function renderFollowersItems(newItems) {
    if (newItems.length === 0) return;

    newItems.forEach((user) => {
        const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 
                           user.email?.split('@')[0] || 'Unknown User';
        const avatar = user.photoURL || 
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff&size=128`;
        const bio = user.bio || 'No biography';

        const itemDiv = document.createElement('div');
        itemDiv.className = 'follower-item-wrapper';
        itemDiv.style.marginBottom = '16px';
        itemDiv.setAttribute('data-user-id', user.uid);
        itemDiv.innerHTML = `
            <div class="follower-item" style="display: flex; align-items: center; gap: 16px; padding: 16px; background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: 12px; transition: all 0.3s ease;">
                <img 
                    src="${avatar}" 
                    alt="${escapeHtml(displayName)}" 
                    style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 3px solid rgba(139, 92, 246, 0.3); cursor: pointer; flex-shrink: 0;"
                    onclick="window.location.href='public-profile.html?id=${user.uid}'"
                    onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff&size=128'"
                >
                <div style="flex: 1; min-width: 0; cursor: pointer;" onclick="window.location.href='public-profile.html?id=${user.uid}'">
                    <h4 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 4px; color: var(--text-primary);">
                        ${escapeHtml(displayName)}
                    </h4>
                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${escapeHtml(bio)}
                    </p>
                    <div style="display: flex; gap: 16px; font-size: 0.85rem; color: var(--text-secondary);">
                        <span><i class="fas fa-file-alt"></i> ${user.postCount || 0} posts</span>
                        <span><i class="fas fa-users"></i> ${user.followersCount || 0} followers</span>
                    </div>
                </div>
                <button 
                    class="btn-secondary" 
                    onclick="removeFollower('${user.uid}')"
                    style="padding: 10px 20px; white-space: nowrap; flex-shrink: 0;"
                >
                    <i class="fas fa-user-times"></i>
                    Remove
                </button>
            </div>
        `;

        followersScrollManager.container.insertBefore(itemDiv, followersScrollManager.sentinel);
    });

    if (followersScrollManager.loadedIds.size === 0 && !followersScrollManager.hasMore) {
        followersScrollManager.container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <i class="fas fa-users" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.5;"></i>
                <p style="font-size: 1.1rem; font-weight: 700;">No followers yet</p>
                <p style="font-size: 0.9rem; margin-top: 8px;">Share your profile to grow your community!</p>
            </div>
        `;
    }
}

// ============================================
// 🆕 CHARGEMENT PAR BATCH - SAVED POSTS
// ============================================

async function loadSavedPostsBatch(lastVisible, limit) {
    if (!currentUserData || !currentUserData.uid) {
        throw new Error('No user data');
    }

    console.log(`📥 Loading saved posts batch (limit: ${limit}, lastVisible: ${lastVisible ? 'yes' : 'no'})...`);

    let query = firebase.firestore()
        .collection('users')
        .doc(currentUserData.uid)
        .collection('savedPosts')
        .limit(limit);

    if (lastVisible) {
        query = query.startAfter(lastVisible);
    }

    const snapshot = await query.get();

    console.log(`✅ Saved posts snapshot size: ${snapshot.size}`);

    const items = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            postId: doc.id,
            savedAt: data.savedAt,
            ...data.postData,
            _docSnapshot: doc
        };
    }).sort((a, b) => {
        if (!a.savedAt) return 1;
        if (!b.savedAt) return -1;
        return b.savedAt.toMillis() - a.savedAt.toMillis();
    });

    if (!lastVisible) {
        const totalSnapshot = await firebase.firestore()
            .collection('users')
            .doc(currentUserData.uid)
            .collection('savedPosts')
            .get();
        
        const savedPostsCountEl = document.getElementById('savedPostsCount');
        if (savedPostsCountEl) {
            savedPostsCountEl.textContent = totalSnapshot.size;
        }
    }

    return {
        items: items,
        lastVisible: snapshot.docs[snapshot.docs.length - 1]
    };
}

function renderSavedPostsItems(newItems) {
    if (newItems.length === 0) return;

    newItems.forEach((post) => {
        const channelBadge = post.channelIcon ? `${post.channelIcon} ${post.channelName}` : post.channelName || 'General';
        const cleanExcerpt = cleanHtmlContent(post.excerpt || post.content || 'No preview available');
        const coverImage = post.coverImage || 'https://via.placeholder.com/400x200?text=No+Image';
        
        let savedDate = 'Recently';
        try {
            if (post.savedAt && post.savedAt.toDate) {
                savedDate = formatRelativeTime(post.savedAt.toDate());
            }
        } catch (dateError) {
            console.warn('⚠ Error formatting date for post:', post.postId, dateError);
        }

        const itemDiv = document.createElement('div');
        itemDiv.className = 'saved-post-item-wrapper';
        itemDiv.style.marginBottom = '16px';
        itemDiv.setAttribute('data-post-id', post.postId);
        itemDiv.innerHTML = `
            <div class="saved-post-item" style="display: flex; gap: 16px; padding: 16px; background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: 12px; transition: all 0.3s ease; cursor: pointer;" onclick="window.location.href='post.html?id=${post.postId}'">
                <img 
                    src="${coverImage}" 
                    alt="${escapeHtml(post.title)}" 
                    style="width: 120px; height: 120px; border-radius: 8px; object-fit: cover; flex-shrink: 0;"
                    onerror="this.src='https://via.placeholder.com/120?text=No+Image'"
                >
                <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
                        <span style="font-size: 0.85rem; color: var(--text-secondary); background: rgba(59, 130, 246, 0.1); padding: 4px 12px; border-radius: 8px;">
                            ${channelBadge}
                        </span>
                        <span style="font-size: 0.85rem; color: var(--text-secondary);">
                            <i class="fas fa-clock"></i> Saved ${savedDate}
                        </span>
                    </div>
                    <h4 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 8px; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${escapeHtml(post.title)}
                    </h4>
                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 12px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                        ${cleanExcerpt}
                    </p>
                    <div style="display: flex; gap: 16px; font-size: 0.85rem; color: var(--text-secondary); flex-wrap: wrap;">
                        <span><i class="fas fa-eye"></i> ${post.views || 0} views</span>
                        <span><i class="fas fa-heart"></i> ${post.likes || 0} likes</span>
                        <span><i class="fas fa-comments"></i> ${post.commentsCount || 0} comments</span>
                    </div>
                </div>
                <button 
                    class="btn-danger" 
                    onclick="event.stopPropagation(); removeSavedPost('${post.postId}')"
                    style="padding: 10px 20px; height: fit-content; white-space: nowrap; flex-shrink: 0;"
                >
                    <i class="fas fa-trash-alt"></i>
                    Remove
                </button>
            </div>
        `;

        savedPostsScrollManager.container.insertBefore(itemDiv, savedPostsScrollManager.sentinel);
    });

    if (savedPostsScrollManager.loadedIds.size === 0 && !savedPostsScrollManager.hasMore) {
        savedPostsScrollManager.container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <i class="fas fa-bookmark" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.5;"></i>
                <p style="font-size: 1.1rem; font-weight: 700;">No saved posts yet</p>
                <p style="font-size: 0.9rem; margin-top: 8px;">Save interesting posts to find them easily!</p>
                <a href="community-hub.html" class="btn-save" style="margin-top: 20px; display: inline-flex; text-decoration: none;">
                    <i class="fas fa-home"></i>
                    Explore Community
                </a>
            </div>
        `;
    }
}

// ============================================
// ACTIONS UTILISATEUR
// ============================================

async function unfollowUser(userId) {
    if (!confirm('Are you sure you want to unfollow this user?')) return;
    
    try {
        if (!currentUserData || !currentUserData.uid) {
            throw new Error('User not authenticated');
        }
        
        const db = firebase.firestore();
        const batch = db.batch();
        
        const followingRef = db.collection('users').doc(currentUserData.uid).collection('following').doc(userId);
        batch.delete(followingRef);
        
        const followerRef = db.collection('users').doc(userId).collection('followers').doc(currentUserData.uid);
        batch.delete(followerRef);
        
        const currentUserRef = db.collection('users').doc(currentUserData.uid);
        batch.update(currentUserRef, {
            followingCount: firebase.firestore.FieldValue.increment(-1)
        });
        
        const followedUserRef = db.collection('users').doc(userId);
        batch.update(followedUserRef, {
            followersCount: firebase.firestore.FieldValue.increment(-1)
        });
        
        await batch.commit();
        
        showToast('success', 'Success', 'User unfollowed successfully');
        
        followingScrollManager.reset();
        setTimeout(() => {
            followingScrollManager.loadMore();
        }, 100);
        
    } catch (error) {
        console.error('❌ Error unfollowing:', error);
        showToast('error', 'Error', 'Failed to unfollow user');
    }
}

async function removeFollower(userId) {
    if (!confirm('Are you sure you want to remove this follower?')) return;
    
    try {
        if (!currentUserData || !currentUserData.uid) {
            throw new Error('User not authenticated');
        }
        
        const db = firebase.firestore();
        const batch = db.batch();
        
        const followerRef = db.collection('users').doc(currentUserData.uid).collection('followers').doc(userId);
        batch.delete(followerRef);
        
        const followingRef = db.collection('users').doc(userId).collection('following').doc(currentUserData.uid);
        batch.delete(followingRef);
        
        const currentUserRef = db.collection('users').doc(currentUserData.uid);
        batch.update(currentUserRef, {
            followersCount: firebase.firestore.FieldValue.increment(-1)
        });
        
        const followerUserRef = db.collection('users').doc(userId);
        batch.update(followerUserRef, {
            followingCount: firebase.firestore.FieldValue.increment(-1)
        });
        
        await batch.commit();
        
        showToast('success', 'Success', 'Follower removed successfully');
        
        followersScrollManager.reset();
        setTimeout(() => {
            followersScrollManager.loadMore();
        }, 100);
        
    } catch (error) {
        console.error('❌ Error removing follower:', error);
        showToast('error', 'Error', 'Failed to remove follower');
    }
}

async function removeSavedPost(postId) {
    if (!confirm('Remove this post from your saved posts?')) return;
    
    try {
        if (!currentUserData || !currentUserData.uid) {
            throw new Error('User not authenticated');
        }
        
        await firebase.firestore()
            .collection('users')
            .doc(currentUserData.uid)
            .collection('savedPosts')
            .doc(postId)
            .delete();
        
        showToast('success', 'Success', 'Post removed from saved');
        
        savedPostsScrollManager.reset();
        setTimeout(() => {
            savedPostsScrollManager.loadMore();
        }, 100);
        
    } catch (error) {
        console.error('❌ Error removing saved post:', error);
        showToast('error', 'Error', 'Failed to remove saved post');
    }
}

// ============================================
// CHARGEMENT DES DONNÉES UTILISATEUR
// ============================================

function loadUserData(userData) {
    console.log('📝 Chargement des données dans les champs...');
    
    try {
        const firstNameInput = document.getElementById('firstName');
        const lastNameInput = document.getElementById('lastName');
        const bioInput = document.getElementById('bio');
        const companyInput = document.getElementById('company');
        const phoneInput = document.getElementById('phone');
        
        if (firstNameInput) firstNameInput.value = userData.firstName || '';
        if (lastNameInput) lastNameInput.value = userData.lastName || '';
        if (bioInput) {
            bioInput.value = userData.bio || '';
            updateBioCharCount();
        }
        if (companyInput) companyInput.value = userData.company || '';
        if (phoneInput) phoneInput.value = userData.phone || '';
        
        const verifiedBadge = document.getElementById('verifiedBadge');
        if (verifiedBadge && userData.emailVerified) {
            verifiedBadge.style.display = 'inline-flex';
        }
        
        if (userData.createdAt) {
            const memberSinceEl = document.getElementById('memberSince');
            if (memberSinceEl) {
                const createdDate = userData.createdAt.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt);
                memberSinceEl.textContent = formatDate(createdDate);
            }
        }
        
        if (userData.lastLoginAt) {
            const lastLoginEl = document.getElementById('lastLogin');
            if (lastLoginEl) {
                const lastLoginDate = userData.lastLoginAt.toDate ? userData.lastLoginAt.toDate() : new Date(userData.lastLoginAt);
                lastLoginEl.textContent = formatRelativeTime(lastLoginDate);
            }
        }
        
        if (userData.uid) {
            loadUserStats(userData.uid);
        }
        
        console.log('✅ Données chargées dans les champs');
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des données:', error);
    }
}

async function loadUserStats(userId) {
    try {
        const analysesSnapshot = await firebase.firestore()
            .collection('users')
            .doc(userId)
            .collection('analyses')
            .get();
        
        const analysesCountEl = document.getElementById('analysesCount');
        if (analysesCountEl) {
            analysesCountEl.textContent = analysesSnapshot.size;
        }
        
        const portfoliosSnapshot = await firebase.firestore()
            .collection('users')
            .doc(userId)
            .collection('portfolios')
            .get();
        
        const portfoliosCountEl = document.getElementById('portfoliosCount');
        if (portfoliosCountEl) {
            portfoliosCountEl.textContent = portfoliosSnapshot.size;
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des stats:', error);
        
        const analysesCountEl = document.getElementById('analysesCount');
        const portfoliosCountEl = document.getElementById('portfoliosCount');
        
        if (analysesCountEl) analysesCountEl.textContent = '—';
        if (portfoliosCountEl) portfoliosCountEl.textContent = '—';
    }
}

// ============================================
// GESTIONNAIRES D'ÉVÉNEMENTS
// ============================================

function initializeEventListeners() {
    const editPersonalInfoBtn = document.getElementById('editPersonalInfo');
    const cancelPersonalInfoBtn = document.getElementById('cancelPersonalInfo');
    const personalInfoForm = document.getElementById('personalInfoForm');
    
    if (editPersonalInfoBtn) {
        editPersonalInfoBtn.addEventListener('click', () => {
            toggleEditPersonalInfo(true);
        });
    }
    
    if (cancelPersonalInfoBtn) {
        cancelPersonalInfoBtn.addEventListener('click', () => {
            toggleEditPersonalInfo(false);
            loadUserData(currentUserData);
        });
    }
    
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', handlePersonalInfoSubmit);
    }
    
    const bioInput = document.getElementById('bio');
    if (bioInput) {
        bioInput.addEventListener('input', updateBioCharCount);
    }
    
    const avatarOverlay = document.getElementById('avatarOverlay');
    const avatarInput = document.getElementById('avatarInput');
    
    if (avatarOverlay) {
        avatarOverlay.addEventListener('click', () => {
            avatarInput.click();
        });
    }
    
    if (avatarInput) {
        avatarInput.addEventListener('change', handleAvatarChange);
    }
    
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const closePasswordModal = document.getElementById('closePasswordModal');
    const cancelPasswordChange = document.getElementById('cancelPasswordChange');
    const changePasswordForm = document.getElementById('changePasswordForm');
    
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
            openModal('changePasswordModal');
        });
    }
    
    if (closePasswordModal) {
        closePasswordModal.addEventListener('click', () => {
            closeModal('changePasswordModal');
        });
    }
    
    if (cancelPasswordChange) {
        cancelPasswordChange.addEventListener('click', () => {
            closeModal('changePasswordModal');
        });
    }
    
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handlePasswordChange);
    }
    
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', handleDeleteAccount);
    }
}

function updateBioCharCount() {
    const bioInput = document.getElementById('bio');
    const bioCharCount = document.getElementById('bioCharCount');
    
    if (bioInput && bioCharCount) {
        bioCharCount.textContent = bioInput.value.length;
    }
}

function toggleEditPersonalInfo(enable) {
    isEditingPersonalInfo = enable;
    
    const inputs = ['firstName', 'lastName', 'bio', 'company', 'phone'];
    const editBtn = document.getElementById('editPersonalInfo');
    const actionsDiv = document.getElementById('personalInfoActions');
    
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.disabled = !enable;
        }
    });
    
    if (editBtn) {
        editBtn.style.display = enable ? 'none' : 'inline-flex';
    }
    
    if (actionsDiv) {
        actionsDiv.style.display = enable ? 'flex' : 'none';
    }
}

async function handlePersonalInfoSubmit(e) {
    e.preventDefault();
    
    if (!currentUserData || !currentUserData.uid) {
        showToast('error', 'Error', 'No user data available');
        return;
    }
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const bio = document.getElementById('bio').value.trim();
    const company = document.getElementById('company').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    if (!firstName || !lastName) {
        showToast('error', 'Error', 'First name and last name are required');
        return;
    }
    
    try {
        const updateData = {
            firstName: firstName,
            lastName: lastName,
            displayName: `${firstName} ${lastName}`,
            bio: bio,
            company: company,
            phone: phone,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await firebase.firestore()
            .collection('users')
            .doc(currentUserData.uid)
            .update(updateData);
        
        const user = firebase.auth().currentUser;
        if (user) {
            await user.updateProfile({
                displayName: `${firstName} ${lastName}`
            });
        }
        
        currentUserData.firstName = firstName;
        currentUserData.lastName = lastName;
        currentUserData.displayName = `${firstName} ${lastName}`;
        currentUserData.bio = bio;
        currentUserData.company = company;
        currentUserData.phone = phone;
        
        document.querySelectorAll('[data-user-name]').forEach(el => {
            el.textContent = `${firstName} ${lastName}`;
        });
        
        const sidebarUserName = document.querySelector('.sidebar-user-name');
        if (sidebarUserName) {
            sidebarUserName.textContent = `${firstName} ${lastName}`;
        }
        
        toggleEditPersonalInfo(false);
        
        showToast('success', 'Success!', 'Your information has been updated');
        
    } catch (error) {
        console.error('❌ Error updating information:', error);
        showToast('error', 'Error', `Failed to update your information: ${error.message}`);
    }
}

async function handleAvatarChange(e) {
    const file = e.target.files[0];
    
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showToast('error', 'Error', 'Please select an image file');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'Error', 'Image must not exceed 5 MB');
        return;
    }
    
    try {
        showToast('info', 'Upload in progress...', 'Uploading your photo to Cloudflare R2');
        
        // ✅ CORRECTION : Appel DIRECT au Worker R2 (bypass r2-profile-upload.js)
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }
        
        const token = await user.getIdToken();
        
        // Créer FormData
        const formData = new FormData();
        formData.append('image', file);
        formData.append('userId', currentUserData.uid);
        
        // Appel direct au Worker
        const response = await fetch('https://images-api.alphavault-ai.com/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Upload failed: ${response.status}`);
        }
        
        const uploadResult = await response.json();
        
        console.log('📤 Upload result from Worker:', uploadResult);
        
        // ✅ Récupérer l'URL directement de la réponse du Worker
        const downloadURL = uploadResult.url;
        
        if (!downloadURL || typeof downloadURL !== 'string' || downloadURL.trim() === '') {
            console.error('❌ Invalid Worker response:', uploadResult);
            throw new Error('No valid image URL returned from upload');
        }
        
        console.log('✅ Download URL:', downloadURL);
        
        // Supprimer l'ancienne photo si elle existe sur R2
        if (currentUserData.photoURL && 
            currentUserData.photoURL.includes('workers.dev') && 
            currentUserData.photoURL !== downloadURL) {
            
            try {
                const oldFileName = currentUserData.photoURL.split('/images/')[1];
                if (oldFileName && window.r2ProfileUpload) {
                    await window.r2ProfileUpload.deleteProfilePicture(oldFileName, currentUserData.uid);
                }
            } catch (deleteError) {
                console.warn('⚠ Could not delete old photo:', deleteError);
            }
        }
        
        // Update Firestore
        await firebase.firestore().collection('users').doc(currentUserData.uid).update({
            photoURL: downloadURL,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update Firebase Auth
        if (user) {
            await user.updateProfile({
                photoURL: downloadURL
            });
        }
        
        // Update local data
        currentUserData.photoURL = downloadURL;
        
        // Update UI
        document.querySelectorAll('[data-user-photo]').forEach(img => {
            img.src = downloadURL;
        });
        
        const sidebarAvatar = document.querySelector('.sidebar-user-avatar img');
        if (sidebarAvatar) {
            sidebarAvatar.src = downloadURL;
        }
        
        showToast('success', 'Success!', 'Your profile picture has been updated on Cloudflare R2');
        
    } catch (error) {
        console.error('❌ Upload error:', error);
        
        let errorMessage = 'Failed to upload photo';
        
        if (error.message.includes('not authenticated')) {
            errorMessage = 'You must be logged in to upload a photo.';
        } else if (error.message.includes('File too large')) {
            errorMessage = 'Image too large. Maximum 5MB.';
        } else if (error.message.includes('Invalid file type')) {
            errorMessage = 'Invalid file format. Use JPG, PNG, GIF or WebP.';
        } else if (error.message.includes('No valid image URL')) {
            errorMessage = 'Upload service returned an invalid response. Please try again.';
        } else {
            errorMessage = error.message || 'Failed to upload photo';
        }
        
        showToast('error', 'Error', errorMessage);
    }
}

async function handlePasswordChange(e) {
    e.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword.length < 6) {
        showToast('error', 'Error', 'Password must be at least 6 characters');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showToast('error', 'Error', 'Passwords do not match');
        return;
    }
    
    try {
        const user = firebase.auth().currentUser;
        
        if (!user) {
            showToast('error', 'Error', 'User not logged in');
            return;
        }
        
        await user.updatePassword(newPassword);
        closeModal('changePasswordModal');
        document.getElementById('changePasswordForm').reset();
        
        showToast('success', 'Success!', 'Your password has been changed');
        
    } catch (error) {
        console.error('❌ Error changing password:', error);
        
        if (error.code === 'auth/requires-recent-login') {
            showToast('error', 'Re-authentication required', 'Please log in again to change your password');
            setTimeout(() => logout(), 2000);
        } else {
            const errorMessage = getFirebaseErrorMessage(error.code);
            showToast('error', 'Error', errorMessage);
        }
    }
}

async function handleDeleteAccount() {
    const confirmed = confirm(
        '⚠ CAREFUL ⚠\n\n' +
        'Are you sure you want to PERMANENTLY delete your account?\n\n' +
        'This will:\n' +
        '• Cancel all active subscriptions\n' +
        '• Delete all your data (posts, analyses, portfolios)\n' +
        '• Delete your profile picture\n' +
        '• Permanently close your account\n\n' +
        'THIS ACTION CANNOT BE UNDONE!'
    );
    
    if (!confirmed) return;
    
    const doubleConfirmed = confirm(
        '🔴 FINAL CONFIRMATION 🔴\n\n' +
        'Type "DELETE" in the next prompt to confirm account deletion.'
    );
    
    if (!doubleConfirmed) return;
    
    const userInput = prompt('Type DELETE (in capital letters) to confirm:');
    
    if (userInput !== 'DELETE') {
        showToast('info', 'Cancelled', 'Account deletion cancelled');
        return;
    }
    
    try {
        const user = firebase.auth().currentUser;
        
        if (!user) {
            showToast('error', 'Error', 'User not connected');
            return;
        }
        
        showToast('info', 'Deletion in progress...', 'Step 1/5: Cancelling subscriptions...');
        
        // ============================================
        // ÉTAPE 1: ANNULER L'ABONNEMENT STRIPE
        // ============================================
        
        if (currentUserData.stripeSubscriptionId) {
            console.log('🗑 Step 1: Cancelling Stripe subscription...');
            
            try {
                const cancelResponse = await fetch(`${WORKER_URL}/cancel-subscription`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        subscriptionId: currentUserData.stripeSubscriptionId
                    })
                });
                
                if (cancelResponse.ok) {
                    console.log('✅ Stripe subscription cancelled');
                } else {
                    console.warn('⚠ Could not cancel Stripe subscription, continuing...');
                }
            } catch (stripeError) {
                console.warn('⚠ Stripe cancellation error:', stripeError);
                // Continue anyway
            }
        }
        
        showToast('info', 'Deletion in progress...', 'Step 2/5: Deleting posts and comments...');
        
        // ============================================
        // ÉTAPE 2: SUPPRIMER LES POSTS & COMMENTAIRES
        // ============================================
        
        console.log('🗑 Step 2: Deleting posts...');
        
        const postsSnapshot = await firebase.firestore()
            .collection('posts')
            .where('authorId', '==', user.uid)
            .get();
        
        const batch1 = firebase.firestore().batch();
        postsSnapshot.docs.forEach(doc => {
            batch1.delete(doc.ref);
        });
        await batch1.commit();
        console.log(`✅ ${postsSnapshot.size} posts deleted`);
        
        showToast('info', 'Deletion in progress...', 'Step 3/5: Deleting analyses and portfolios...');
        
        // ============================================
        // ÉTAPE 3: SUPPRIMER LES SOUS-COLLECTIONS
        // ============================================
        
        console.log('🗑 Step 3: Deleting subcollections...');
        
        const subcollections = [
            'analyses',
            'portfolios',
            'following',
            'followers',
            'savedPosts',
            'settings'
        ];
        
        for (const subcoll of subcollections) {
            const snapshot = await firebase.firestore()
                .collection('users')
                .doc(user.uid)
                .collection(subcoll)
                .get();
            
            const batch = firebase.firestore().batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            
            console.log(`✅ ${snapshot.size} documents deleted from ${subcoll}`);
        }
        
        showToast('info', 'Deletion in progress...', 'Step 4/5: Deleting profile picture...');
        
        // ============================================
        // ÉTAPE 4: SUPPRIMER LA PHOTO DE PROFIL R2
        // ============================================
        
        if (currentUserData.photoURL && 
            (currentUserData.photoURL.includes('workers.dev') || 
             currentUserData.photoURL.includes('r2.dev'))) {
            
            console.log('🗑 Step 4: Deleting profile picture from R2...');
            
            try {
                const fileName = currentUserData.photoURL.split('/images/')[1];
                if (fileName && window.r2ProfileUpload) {
                    await window.r2ProfileUpload.deleteProfilePicture(fileName, user.uid);
                    console.log('✅ Profile picture deleted from R2');
                }
            } catch (r2Error) {
                console.warn('⚠ Could not delete R2 photo:', r2Error);
            }
        }
        
        showToast('info', 'Deletion in progress...', 'Step 5/5: Deleting account...');
        
        // ============================================
        // ÉTAPE 5: SUPPRIMER LE DOCUMENT UTILISATEUR
        // ============================================
        
        console.log('🗑 Step 5: Deleting user document...');
        
        await firebase.firestore()
            .collection('users')
            .doc(user.uid)
            .delete();
        
        console.log('✅ User document deleted');
        
        // ============================================
        // ÉTAPE 6: SUPPRIMER LE COMPTE FIREBASE AUTH
        // ============================================
        
        console.log('🗑 Step 6: Deleting Firebase Auth account...');
        
        await user.delete();
        
        console.log('✅ Firebase Auth account deleted');
        
        // ============================================
        // REDIRECTION
        // ============================================
        
        showToast('success', 'Account deleted', 'Your account has been permanently deleted');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        console.error('❌ Error deleting account:', error);
        
        if (error.code === 'auth/requires-recent-login') {
            showToast('error', 'Re-authentication required', 'Please log in again to delete your account');
            setTimeout(() => logout(), 2000);
        } else {
            const errorMessage = getFirebaseErrorMessage(error.code);
            showToast('error', 'Error', `Deletion failed: ${errorMessage}`);
        }
    }
}

// ============================================
// UTILITAIRES
// ============================================

function cleanHtmlContent(htmlString) {
    if (!htmlString) return 'No preview available';
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    
    let cleanText = tempDiv.textContent || tempDiv.innerText || '';
    
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    
    if (cleanText.length > 200) {
        cleanText = cleanText.substring(0, 200) + '...';
    }
    
    return cleanText || 'No preview available';
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatRelativeTime(date) {
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) {
        return 'A few seconds ago';
    } else if (minutes < 60) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (days < 7) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
        return formatDate(date);
    }
}

function showToast(type, title, message) {
    const toastContainer = document.getElementById('toastContainer');
    
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconClass = 'fa-info-circle';
    switch(type) {
        case 'success':
            iconClass = 'fa-check-circle';
            break;
        case 'error':
            iconClass = 'fa-times-circle';
            break;
        case 'warning':
            iconClass = 'fa-exclamation-triangle';
            break;
    }
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${iconClass}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        removeToast(toast);
    });
    
    setTimeout(() => {
        removeToast(toast);
    }, 5000);
}

function removeToast(toast) {
    toast.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

function getFirebaseErrorMessage(errorCode) {
    if (typeof window.getFirebaseErrorMessage === 'function') {
        return window.getFirebaseErrorMessage(errorCode);
    }
    
    return `Error: ${errorCode}`;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function logout() {
    try {
        await firebase.auth().signOut();
        window.location.href = 'login.html';
    } catch (error) {
        console.error('❌ Error logging out:', error);
        alert('Error logging out');
    }
}

const toastStyle = document.createElement('style');
toastStyle.textContent = `
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(toastStyle);

console.log('✅ Script de profil chargé (v4.5 - Auto-chargement si pas de scroll)');