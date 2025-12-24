// /* ============================================
//    ALPHAVAULT AI - COMMUNITY FIREBASE SERVICE
//    Gestion Firestore pour le Blog
//    ============================================ */

// class CommunityFirebaseService {
//     constructor() {
//         this.db = firebase.firestore();
//         this.storage = firebase.storage();
//         this.auth = firebase.auth();
        
//         // Collections
//         this.postsCollection = this.db.collection('community_posts');
//         this.commentsCollection = this.db.collection('community_comments');
//         this.channelsCollection = this.db.collection('community_channels');
//         this.usersCollection = this.db.collection('users');
        
//         // Cache
//         this.postsCache = new Map();
//         this.channelsCache = null;
        
//         console.log('✅ Community Firebase Service initialized');
//     }

//     // ============================================
//     // CHANNELS MANAGEMENT
//     // ============================================

//     async initializeChannels() {
//         try {
//             const snapshot = await this.channelsCollection.get();
            
//             if (snapshot.empty) {
//                 console.log('📝 Creating default channels...');
//                 await this.createDefaultChannels();
//             }
            
//             return await this.getChannels();
//         } catch (error) {
//             console.error('❌ Error initializing channels:', error);
//             throw error;
//         }
//     }

//     async createDefaultChannels() {
//         const defaultChannels = [
//             {
//                 id: 'market-analysis',
//                 name: 'Market Analysis',
//                 description: 'Technical & fundamental market analysis',
//                 icon: '📈',
//                 gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
//                 subscriberCount: 0,
//                 postCount: 0
//             },
//             {
//                 id: 'ma-intelligence',
//                 name: 'M&A Intelligence',
//                 description: 'Mergers, acquisitions, and deal analysis',
//                 icon: '💼',
//                 gradient: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
//                 subscriberCount: 0,
//                 postCount: 0
//             },
//             {
//                 id: 'trading-strategies',
//                 name: 'Trading Strategies',
//                 description: 'Quantitative strategies and backtests',
//                 icon: '🎯',
//                 gradient: 'linear-gradient(135deg, #10B981, #059669)',
//                 subscriberCount: 0,
//                 postCount: 0
//             },
//             {
//                 id: 'ipo-watch',
//                 name: 'IPO Watch',
//                 description: 'New IPOs and pre-IPO analysis',
//                 icon: '🚀',
//                 gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
//                 subscriberCount: 0,
//                 postCount: 0
//             },
//             {
//                 id: 'portfolio-reviews',
//                 name: 'Portfolio Reviews',
//                 description: 'Share portfolios and get feedback',
//                 icon: '📊',
//                 gradient: 'linear-gradient(135deg, #EC4899, #D946EF)',
//                 subscriberCount: 0,
//                 postCount: 0
//             },
//             {
//                 id: 'ai-quant',
//                 name: 'AI & Quant',
//                 description: 'Machine learning and quantitative models',
//                 icon: '🤖',
//                 gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)',
//                 subscriberCount: 0,
//                 postCount: 0
//             },
//             {
//                 id: 'ideas-insights',
//                 name: 'Ideas & Insights',
//                 description: 'Investment theses and opportunities',
//                 icon: '💡',
//                 gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)',
//                 subscriberCount: 0,
//                 postCount: 0
//             },
//             {
//                 id: 'news-events',
//                 name: 'News & Events',
//                 description: 'Market news and upcoming events',
//                 icon: '📰',
//                 gradient: 'linear-gradient(135deg, #EF4444, #DC2626)',
//                 subscriberCount: 0,
//                 postCount: 0
//             },
//             {
//                 id: 'education',
//                 name: 'Education',
//                 description: 'Tutorials and learning resources',
//                 icon: '🎓',
//                 gradient: 'linear-gradient(135deg, #EAB308, #CA8A04)',
//                 subscriberCount: 0,
//                 postCount: 0
//             },
//             {
//                 id: 'success-stories',
//                 name: 'Success Stories',
//                 description: 'Winning trades and achievements',
//                 icon: '🏆',
//                 gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
//                 subscriberCount: 0,
//                 postCount: 0
//             }
//         ];

//         const batch = this.db.batch();
        
//         defaultChannels.forEach(channel => {
//             const docRef = this.channelsCollection.doc(channel.id);
//             batch.set(docRef, {
//                 ...channel,
//                 createdAt: firebase.firestore.FieldValue.serverTimestamp()
//             });
//         });

//         await batch.commit();
//         console.log('✅ Default channels created');
//     }

//     async getChannels() {
//         try {
//             if (this.channelsCache) {
//                 return this.channelsCache;
//             }

//             const snapshot = await this.channelsCollection
//                 .orderBy('name', 'asc')
//                 .get();

//             const channels = snapshot.docs.map(doc => ({
//                 id: doc.id,
//                 ...doc.data()
//             }));

//             this.channelsCache = channels;
//             return channels;
//         } catch (error) {
//             console.error('❌ Error fetching channels:', error);
//             throw error;
//         }
//     }

//     // ============================================
//     // POSTS MANAGEMENT
//     // ============================================

//     async createPost(postData) {
//         try {
//             const currentUser = this.auth.currentUser;
//             if (!currentUser) throw new Error('User not authenticated');

//             // Get user data
//             const userDoc = await this.usersCollection.doc(currentUser.uid).get();
//             const userData = userDoc.data() || {};

//             const post = {
//                 channelId: postData.channelId,
//                 authorId: currentUser.uid,
//                 authorName: userData.displayName || currentUser.email.split('@')[0],
//                 authorAvatar: userData.photoURL || null,  // ✅ Utilise photoURL de users
//                 authorPhoto: userData.photoURL || null,   // ✅ AJOUTER AUSSI pour compatibilité
//                 authorBadges: userData.badges || [],
//                 title: postData.title,
//                 content: postData.content,
//                 images: postData.images || [],
//                 tags: postData.tags || [],
//                 createdAt: firebase.firestore.FieldValue.serverTimestamp(),
//                 updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
//                 viewCount: 0,
//                 upvotes: 0,
//                 downvotes: 0,
//                 upvotedBy: [],
//                 downvotedBy: [],
//                 commentCount: 0,
//                 isPinned: false,
//                 isFeatured: false
//             };

//             const docRef = await this.postsCollection.add(post);

//             // Update channel post count
//             await this.channelsCollection.doc(postData.channelId).update({
//                 postCount: firebase.firestore.FieldValue.increment(1)
//             });

//             // Update user stats
//             await this.usersCollection.doc(currentUser.uid).update({
//                 postCount: firebase.firestore.FieldValue.increment(1),
//                 reputation: firebase.firestore.FieldValue.increment(10)
//             });

//             console.log('✅ Post created:', docRef.id);
//             return { id: docRef.id, ...post };
//         } catch (error) {
//             console.error('❌ Error creating post:', error);
//             throw error;
//         }
//     }

//     async getPosts(options = {}) {
//         try {
//             const {
//                 channelId = null,
//                 limit = 20,
//                 orderBy = 'createdAt',
//                 orderDirection = 'desc',
//                 lastDoc = null
//             } = options;

//             let query = this.postsCollection;

//             // ✅ DEBUG : Vérifier le channelId
//             console.log('🔍 Filtering posts by channelId:', channelId);

//             if (channelId && channelId !== 'all') {
//                 query = query.where('channelId', '==', channelId);
//                 console.log('✅ Filter applied for channel:', channelId);
//             }

//             query = query.orderBy(orderBy, orderDirection);

//             if (lastDoc) {
//                 query = query.startAfter(lastDoc);
//             }

//             query = query.limit(limit);

//             const snapshot = await query.get();

//             const posts = snapshot.docs.map(doc => ({
//                 id: doc.id,
//                 ...doc.data(),
//                 createdAt: doc.data().createdAt?.toDate(),
//                 updatedAt: doc.data().updatedAt?.toDate(),
//                 _doc: doc
//             }));

//             return {
//                 posts,
//                 lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
//                 hasMore: snapshot.docs.length === limit
//             };
//         } catch (error) {
//             console.error('❌ Error fetching posts:', error);
//             throw error;
//         }
//     }

//     async getPost(postId) {
//         try {
//             if (this.postsCache.has(postId)) {
//                 return this.postsCache.get(postId);
//             }

//             const doc = await this.postsCollection.doc(postId).get();

//             if (!doc.exists) {
//                 throw new Error('Post not found');
//             }

//             const post = {
//                 id: doc.id,
//                 ...doc.data(),
//                 createdAt: doc.data().createdAt?.toDate(),
//                 updatedAt: doc.data().updatedAt?.toDate()
//             };

//             this.postsCache.set(postId, post);

//             // Increment view count
//             await this.postsCollection.doc(postId).update({
//                 viewCount: firebase.firestore.FieldValue.increment(1)
//             });

//             return post;
//         } catch (error) {
//             console.error('❌ Error fetching post:', error);
//             throw error;
//         }
//     }

//     async upvotePost(postId) {
//         try {
//             const currentUser = this.auth.currentUser;
//             if (!currentUser) throw new Error('User not authenticated');

//             const postRef = this.postsCollection.doc(postId);
//             const postDoc = await postRef.get();
//             const post = postDoc.data();

//             const hasUpvoted = post.upvotedBy?.includes(currentUser.uid);
//             const hasDownvoted = post.downvotedBy?.includes(currentUser.uid);

//             const batch = this.db.batch();

//             if (hasUpvoted) {
//                 // Remove upvote
//                 batch.update(postRef, {
//                     upvotes: firebase.firestore.FieldValue.increment(-1),
//                     upvotedBy: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
//                 });
//             } else {
//                 // Add upvote
//                 batch.update(postRef, {
//                     upvotes: firebase.firestore.FieldValue.increment(1),
//                     upvotedBy: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
//                 });

//                 // Remove downvote if exists
//                 if (hasDownvoted) {
//                     batch.update(postRef, {
//                         downvotes: firebase.firestore.FieldValue.increment(-1),
//                         downvotedBy: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
//                     });
//                 }

//                 // Update author reputation
//                 batch.update(this.usersCollection.doc(post.authorId), {
//                     reputation: firebase.firestore.FieldValue.increment(5)
//                 });
//             }

//             await batch.commit();
//             this.postsCache.delete(postId);

//             console.log('✅ Post upvoted');
//         } catch (error) {
//             console.error('❌ Error upvoting post:', error);
//             throw error;
//         }
//     }

//     async downvotePost(postId) {
//         try {
//             const currentUser = this.auth.currentUser;
//             if (!currentUser) throw new Error('User not authenticated');

//             const postRef = this.postsCollection.doc(postId);
//             const postDoc = await postRef.get();
//             const post = postDoc.data();

//             const hasDownvoted = post.downvotedBy?.includes(currentUser.uid);
//             const hasUpvoted = post.upvotedBy?.includes(currentUser.uid);

//             const batch = this.db.batch();

//             if (hasDownvoted) {
//                 // Remove downvote
//                 batch.update(postRef, {
//                     downvotes: firebase.firestore.FieldValue.increment(-1),
//                     downvotedBy: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
//                 });
//             } else {
//                 // Add downvote
//                 batch.update(postRef, {
//                     downvotes: firebase.firestore.FieldValue.increment(1),
//                     downvotedBy: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
//                 });

//                 // Remove upvote if exists
//                 if (hasUpvoted) {
//                     batch.update(postRef, {
//                         upvotes: firebase.firestore.FieldValue.increment(-1),
//                         upvotedBy: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
//                     });
//                 }
//             }

//             await batch.commit();
//             this.postsCache.delete(postId);

//             console.log('✅ Post downvoted');
//         } catch (error) {
//             console.error('❌ Error downvoting post:', error);
//             throw error;
//         }
//     }

//     // ============================================
//     // COMMENTS MANAGEMENT
//     // ============================================

//     async createComment(commentData) {
//         try {
//             const currentUser = this.auth.currentUser;
//             if (!currentUser) throw new Error('User not authenticated');

//             const userDoc = await this.usersCollection.doc(currentUser.uid).get();
//             const userData = userDoc.data() || {};

//             const comment = {
//                 postId: commentData.postId,
//                 authorId: currentUser.uid,
//                 authorName: userData.displayName || currentUser.email.split('@')[0],
//                 authorAvatar: userData.photoURL || null,  // ✅ Ajouter la photo
//                 authorPhoto: userData.photoURL || null,   // ✅ Pour compatibilité
//                 content: commentData.content,
//                 parentCommentId: commentData.parentCommentId || null,
//                 upvotes: 0,
//                 upvotedBy: [],
//                 createdAt: firebase.firestore.FieldValue.serverTimestamp()
//             };

//             console.log('📝 Création du commentaire:', comment);

//             const docRef = await this.commentsCollection.add(comment);

//             console.log('✅ Commentaire créé avec ID:', docRef.id);

//             // Update post comment count
//             await this.postsCollection.doc(commentData.postId).update({
//                 commentCount: firebase.firestore.FieldValue.increment(1)
//             });

//             // Update user stats
//             await this.usersCollection.doc(currentUser.uid).update({
//                 reputation: firebase.firestore.FieldValue.increment(2)
//             });

//             console.log('✅ Comment created:', docRef.id);
//             return { id: docRef.id, ...comment };
//         } catch (error) {
//             console.error('❌ Error creating comment:', error);
//             throw error;
//         }
//     }

//     async getComments(postId) {
//         try {
//             console.log('🔍 Récupération des commentaires pour le post:', postId);
            
//             const snapshot = await this.commentsCollection
//                 .where('postId', '==', postId)
//                 .orderBy('createdAt', 'asc')
//                 .get();

//             console.log('📊 Nombre de commentaires trouvés:', snapshot.size);
            
//             const comments = snapshot.docs.map(doc => {
//                 const data = doc.data();
//                 console.log('📄 Commentaire:', data);
                
//                 return {
//                     id: doc.id,
//                     ...data,
//                     createdAt: data.createdAt?.toDate()
//                 };
//             });

//             // Organize comments into threads
//             const commentMap = new Map();
//             const rootComments = [];

//             comments.forEach(comment => {
//                 comment.replies = [];
//                 commentMap.set(comment.id, comment);
//             });

//             comments.forEach(comment => {
//                 if (comment.parentCommentId) {
//                     const parent = commentMap.get(comment.parentCommentId);
//                     if (parent) {
//                         parent.replies.push(comment);
//                     }
//                 } else {
//                     rootComments.push(comment);
//                 }
//             });

//             console.log('✅ Commentaires organisés:', rootComments);

//             return rootComments;
//         } catch (error) {
//             console.error('❌ Error fetching comments:', error);
//             throw error;
//         }
//     }

//     async upvoteComment(commentId) {
//         try {
//             const currentUser = this.auth.currentUser;
//             if (!currentUser) throw new Error('User not authenticated');

//             const commentRef = this.commentsCollection.doc(commentId);
//             const commentDoc = await commentRef.get();
//             const comment = commentDoc.data();

//             const hasUpvoted = comment.upvotedBy?.includes(currentUser.uid);

//             if (hasUpvoted) {
//                 await commentRef.update({
//                     upvotes: firebase.firestore.FieldValue.increment(-1),
//                     upvotedBy: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
//                 });
//             } else {
//                 await commentRef.update({
//                     upvotes: firebase.firestore.FieldValue.increment(1),
//                     upvotedBy: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
//                 });
//             }

//             console.log('✅ Comment upvoted');
//         } catch (error) {
//             console.error('❌ Error upvoting comment:', error);
//             throw error;
//         }
//     }

//     // ============================================
//     // IMAGE UPLOAD
//     // ============================================

//     async uploadImage(file) {
//         try {
//             const currentUser = this.auth.currentUser;
//             if (!currentUser) throw new Error('User not authenticated');

//             const timestamp = Date.now();
//             const fileName = `${currentUser.uid}/${timestamp}_${file.name}`;
//             const storageRef = this.storage.ref(`community_images/${fileName}`);

//             const snapshot = await storageRef.put(file);
//             const downloadURL = await snapshot.ref.getDownloadURL();

//             console.log('✅ Image uploaded:', downloadURL);
//             return downloadURL;
//         } catch (error) {
//             console.error('❌ Error uploading image:', error);
//             throw error;
//         }
//     }

//     // ============================================
//     // STATISTICS
//     // ============================================

//     async getCommunityStats() {
//         try {
//             const [postsSnapshot, usersSnapshot] = await Promise.all([
//                 this.postsCollection.get(),
//                 this.usersCollection.get()
//             ]);

//             const posts = postsSnapshot.docs.map(doc => doc.data());
//             const today = new Date();
//             today.setHours(0, 0, 0, 0);

//             const postsToday = posts.filter(post => {
//                 const postDate = post.createdAt?.toDate();
//                 return postDate && postDate >= today;
//             });

//             return {
//                 totalPosts: postsSnapshot.size,
//                 totalMembers: usersSnapshot.size,
//                 postsToday: postsToday.length
//             };
//         } catch (error) {
//             console.error('❌ Error fetching stats:', error);
//             return { totalPosts: 0, totalMembers: 0, postsToday: 0 };
//         }
//     }

//     async getTopContributors(limit = 5) {
//         try {
//             // Récupérer TOUS les utilisateurs (sans orderBy pour éviter l'index)
//             const snapshot = await this.usersCollection.get();
            
//             // Trier côté client
//             const users = snapshot.docs
//                 .map(doc => ({
//                     uid: doc.id,
//                     ...doc.data(),
//                     reputation: doc.data().reputation || 0
//                 }))
//                 .sort((a, b) => b.reputation - a.reputation)  // Tri descendant
//                 .slice(0, limit);  // Limiter aux N premiers
            
//             return users;
//         } catch (error) {
//             console.error('❌ Error fetching top contributors:', error);
//             return [];
//         }
//     }

//     async getFeaturedPosts(limit = 3) {
//         try {
//             const snapshot = await this.postsCollection
//                 .where('isFeatured', '==', true)
//                 .orderBy('createdAt', 'desc')
//                 .limit(limit)
//                 .get();

//             return snapshot.docs.map(doc => ({
//                 id: doc.id,
//                 ...doc.data(),
//                 createdAt: doc.data().createdAt?.toDate()
//             }));
//         } catch (error) {
//             console.error('❌ Error fetching featured posts:', error);
//             return [];
//         }
//     }

//     async getTrendingTags(limit = 10) {
//         try {
//             const snapshot = await this.postsCollection
//                 .orderBy('createdAt', 'desc')
//                 .limit(100)
//                 .get();

//             const tagCount = new Map();

//             snapshot.docs.forEach(doc => {
//                 const tags = doc.data().tags || [];
//                 tags.forEach(tag => {
//                     tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
//                 });
//             });

//             const sortedTags = Array.from(tagCount.entries())
//                 .sort((a, b) => b[1] - a[1])
//                 .slice(0, limit)
//                 .map(([tag, count]) => ({ tag, count }));

//             return sortedTags;
//         } catch (error) {
//             console.error('❌ Error fetching trending tags:', error);
//             return [];
//         }
//     }
// }

// // Global instance
// window.communityService = new CommunityFirebaseService();

/* ============================================
   ALPHAVAULT AI - COMMUNITY FIREBASE SERVICE
   Gestion des posts avec images sur Cloudflare R2
   Version: 2.0
   ============================================ */

class CommunityFirebaseService {
    constructor() {
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        
        // ⚠ REMPLACE PAR L'URL DE TON WORKER IMAGE STORAGE
        // Soit le domaine personnalisé, soit l'URL workers.dev
        this.imageWorkerUrl = 'https://images-api.alphavault-ai.com'; // OU https://alphavault-image-storage.xxx.workers.dev
    }

    /* ==========================================
       📤 UPLOAD D'IMAGE VERS CLOUDFLARE R2
       ========================================== */
    
    async uploadImage(file) {
        try {
            console.log('📤 Starting image upload...');

            // Validations client-side
            const MAX_SIZE = 5 * 1024 * 1024; // 5MB
            if (file.size > MAX_SIZE) {
                throw new Error(`Image too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max: 5MB`);
            }

            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                throw new Error(`Invalid file type: ${file.type}. Allowed: JPG, PNG, GIF, WEBP`);
            }

            // Vérifier l'authentification
            const user = this.auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            console.log('👤 User ID:', user.uid);

            // Optimiser l'image avant upload
            const optimizedBlob = await this.optimizeImage(file);

            // Préparer le FormData
            const formData = new FormData();
            formData.append('image', optimizedBlob, file.name);
            formData.append('userId', user.uid);

            // Récupérer le token Firebase
            const token = await user.getIdToken();

            console.log('🚀 Uploading to Cloudflare R2...');

            // Upload vers le Worker
            const response = await fetch(`${this.imageWorkerUrl}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Upload failed (${response.status})`);
            }

            const result = await response.json();

            console.log('✅ Image uploaded successfully:', result.imageUrl);

            return result.imageUrl;

        } catch (error) {
            console.error('❌ Error uploading image:', error);
            throw error;
        }
    }

    /* ==========================================
       🖼 OPTIMISATION D'IMAGE
       ========================================== */
    
    async optimizeImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    // Dimensions maximales
                    const MAX_WIDTH = 1600;
                    const MAX_HEIGHT = 1600;
                    
                    let width = img.width;
                    let height = img.height;
                    
                    // Calculer le ratio pour maintenir les proportions
                    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
                        width = Math.floor(width * ratio);
                        height = Math.floor(height * ratio);
                    }
                    
                    // Créer un canvas
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convertir en Blob
                    canvas.toBlob((blob) => {
                        if (blob) {
                            console.log('🖼 Image optimized:', {
                                originalSize: (file.size / 1024).toFixed(2) + ' KB',
                                optimizedSize: (blob.size / 1024).toFixed(2) + ' KB',
                                dimensions: `${width}x${height}`
                            });
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to optimize image'));
                        }
                    }, 'image/jpeg', 0.85); // JPEG 85% qualité
                };
                
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    /* ==========================================
       🗑 SUPPRESSION D'IMAGE
       ========================================== */
    
    async deleteImage(imageUrl) {
        try {
            const user = this.auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            // Extraire le fileName depuis l'URL
            // Format: https://xxx/images/userId/timestamp-random.ext
            const urlParts = imageUrl.split('/images/');
            if (urlParts.length !== 2) {
                console.warn('⚠ Invalid image URL format:', imageUrl);
                return; // Ne pas throw - l'image peut être externe
            }

            const fileName = urlParts[1];
            console.log('🗑 Deleting image:', fileName);

            const token = await user.getIdToken();

            const response = await fetch(`${this.imageWorkerUrl}/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    fileName: fileName,
                    userId: user.uid
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Delete failed:', errorData.message);
                // Ne pas throw - l'image peut déjà être supprimée
                return;
            }

            const result = await response.json();
            console.log('✅ Image deleted:', result.message);

        } catch (error) {
            console.error('❌ Error deleting image:', error);
            // Ne pas throw - ne pas bloquer la suppression du post
        }
    }

    /* ==========================================
       📋 LISTER LES IMAGES D'UN UTILISATEUR
       ========================================== */
    
    async listUserImages() {
        try {
            const user = this.auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const token = await user.getIdToken();

            const response = await fetch(`${this.imageWorkerUrl}/list?userId=${user.uid}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to list images');
            }

            const result = await response.json();
            return result.images;

        } catch (error) {
            console.error('❌ Error listing images:', error);
            throw error;
        }
    }

    /* ==========================================
       📂 GESTION DES CHANNELS
       ========================================== */
    
    async getChannels() {
        try {
            const snapshot = await this.db.collection('channels')
                .orderBy('order', 'asc')
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('❌ Error getting channels:', error);
            throw error;
        }
    }

    async getChannel(channelId) {
        try {
            const doc = await this.db.collection('channels').doc(channelId).get();
            
            if (!doc.exists) {
                throw new Error('Channel not found');
            }

            return {
                id: doc.id,
                ...doc.data()
            };
        } catch (error) {
            console.error('❌ Error getting channel:', error);
            throw error;
        }
    }

    /* ==========================================
       📝 GESTION DES POSTS
       ========================================== */
    
    async createPost(postData) {
        try {
            const user = this.auth.currentUser;
            if (!user) throw new Error('User not authenticated');

            const userDoc = await this.db.collection('users').doc(user.uid).get();
            const userData = userDoc.data() || {};

            const post = {
                channelId: postData.channelId,
                title: postData.title,
                content: postData.content,
                tags: postData.tags || [],
                images: postData.images || [], // URLs depuis R2
                authorId: user.uid,
                authorName: userData.displayName || user.displayName || 'Anonymous',
                authorPhoto: userData.photoURL || user.photoURL || null,
                authorPlan: userData.plan || 'free',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                views: 0,
                likes: [],
                commentsCount: 0,
                isPinned: false,
                isLocked: false
            };

            const docRef = await this.db.collection('posts').add(post);
            
            console.log('✅ Post created:', docRef.id);
            
            return {
                id: docRef.id,
                ...post
            };

        } catch (error) {
            console.error('❌ Error creating post:', error);
            throw error;
        }
    }

    async updatePost(postId, updateData) {
        try {
            const user = this.auth.currentUser;
            if (!user) throw new Error('User not authenticated');

            const postDoc = await this.db.collection('posts').doc(postId).get();
            if (!postDoc.exists) throw new Error('Post not found');
            
            const postData = postDoc.data();
            if (postData.authorId !== user.uid) {
                throw new Error('You are not authorized to edit this post');
            }

            // Supprimer les anciennes images si nécessaire
            if (updateData.imagesToDelete && updateData.imagesToDelete.length > 0) {
                for (const imageUrl of updateData.imagesToDelete) {
                    await this.deleteImage(imageUrl);
                }
            }

            const updates = {
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (updateData.title) updates.title = updateData.title;
            if (updateData.content) updates.content = updateData.content;
            if (updateData.tags !== undefined) updates.tags = updateData.tags;
            if (updateData.images !== undefined) updates.images = updateData.images;
            if (updateData.channelId) updates.channelId = updateData.channelId;

            await this.db.collection('posts').doc(postId).update(updates);
            
            console.log('✅ Post updated:', postId);
            
            return {
                id: postId,
                ...updates
            };

        } catch (error) {
            console.error('❌ Error updating post:', error);
            throw error;
        }
    }

    async deletePost(postId) {
        try {
            const user = this.auth.currentUser;
            if (!user) throw new Error('User not authenticated');

            const postDoc = await this.db.collection('posts').doc(postId).get();
            if (!postDoc.exists) throw new Error('Post not found');
            
            const postData = postDoc.data();
            if (postData.authorId !== user.uid) {
                throw new Error('You are not authorized to delete this post');
            }

            // Supprimer les images R2
            if (postData.images && postData.images.length > 0) {
                for (const imageUrl of postData.images) {
                    await this.deleteImage(imageUrl);
                }
            }

            await this.db.collection('posts').doc(postId).delete();
            
            console.log('✅ Post deleted:', postId);

        } catch (error) {
            console.error('❌ Error deleting post:', error);
            throw error;
        }
    }

    async getPost(postId) {
        try {
            const doc = await this.db.collection('posts').doc(postId).get();
            
            if (!doc.exists) {
                throw new Error('Post not found');
            }

            return {
                id: doc.id,
                ...doc.data()
            };
        } catch (error) {
            console.error('❌ Error getting post:', error);
            throw error;
        }
    }

    async getPosts(options = {}) {
        try {
            let query = this.db.collection('posts');

            if (options.channelId) {
                query = query.where('channelId', '==', options.channelId);
            }

            if (options.tag) {
                query = query.where('tags', 'array-contains', options.tag);
            }

            if (options.authorId) {
                query = query.where('authorId', '==', options.authorId);
            }

            const sortBy = options.sortBy || 'createdAt';
            const sortOrder = options.sortOrder || 'desc';
            query = query.orderBy(sortBy, sortOrder);

            if (options.limit) {
                query = query.limit(options.limit);
            }

            if (options.startAfter) {
                query = query.startAfter(options.startAfter);
            }

            const snapshot = await query.get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

        } catch (error) {
            console.error('❌ Error getting posts:', error);
            throw error;
        }
    }

    async incrementViews(postId) {
        try {
            await this.db.collection('posts').doc(postId).update({
                views: firebase.firestore.FieldValue.increment(1)
            });
        } catch (error) {
            console.error('❌ Error incrementing views:', error);
        }
    }

    async toggleLike(postId) {
        try {
            const user = this.auth.currentUser;
            if (!user) throw new Error('User not authenticated');

            const postRef = this.db.collection('posts').doc(postId);
            const postDoc = await postRef.get();
            
            if (!postDoc.exists) throw new Error('Post not found');

            const postData = postDoc.data();
            const likes = postData.likes || [];
            const hasLiked = likes.includes(user.uid);

            if (hasLiked) {
                await postRef.update({
                    likes: firebase.firestore.FieldValue.arrayRemove(user.uid)
                });
                return { liked: false, count: likes.length - 1 };
            } else {
                await postRef.update({
                    likes: firebase.firestore.FieldValue.arrayUnion(user.uid)
                });
                return { liked: true, count: likes.length + 1 };
            }

        } catch (error) {
            console.error('❌ Error toggling like:', error);
            throw error;
        }
    }

    /* ==========================================
       💬 GESTION DES COMMENTAIRES
       ========================================== */
    
    async addComment(postId, content) {
        try {
            const user = this.auth.currentUser;
            if (!user) throw new Error('User not authenticated');

            const userDoc = await this.db.collection('users').doc(user.uid).get();
            const userData = userDoc.data() || {};

            const comment = {
                postId: postId,
                content: content,
                authorId: user.uid,
                authorName: userData.displayName || user.displayName || 'Anonymous',
                authorPhoto: userData.photoURL || user.photoURL || null,
                authorPlan: userData.plan || 'free',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                likes: []
            };

            const docRef = await this.db.collection('comments').add(comment);

            await this.db.collection('posts').doc(postId).update({
                commentsCount: firebase.firestore.FieldValue.increment(1)
            });

            console.log('✅ Comment added:', docRef.id);

            return {
                id: docRef.id,
                ...comment
            };

        } catch (error) {
            console.error('❌ Error adding comment:', error);
            throw error;
        }
    }

    async getComments(postId) {
        try {
            const snapshot = await this.db.collection('comments')
                .where('postId', '==', postId)
                .orderBy('createdAt', 'desc')
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

        } catch (error) {
            console.error('❌ Error getting comments:', error);
            throw error;
        }
    }

    async deleteComment(commentId, postId) {
        try {
            const user = this.auth.currentUser;
            if (!user) throw new Error('User not authenticated');

            const commentDoc = await this.db.collection('comments').doc(commentId).get();
            if (!commentDoc.exists) throw new Error('Comment not found');
            
            const commentData = commentDoc.data();
            if (commentData.authorId !== user.uid) {
                throw new Error('You are not authorized to delete this comment');
            }

            await this.db.collection('comments').doc(commentId).delete();

            await this.db.collection('posts').doc(postId).update({
                commentsCount: firebase.firestore.FieldValue.increment(-1)
            });

            console.log('✅ Comment deleted:', commentId);

        } catch (error) {
            console.error('❌ Error deleting comment:', error);
            throw error;
        }
    }
}

// Initialiser le service
window.communityService = new CommunityFirebaseService();
console.log('✅ Community Service initialized with Cloudflare R2 Image Storage');