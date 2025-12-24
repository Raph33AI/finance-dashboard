/* ============================================
   ALPHAVAULT AI - COMMUNITY FIREBASE SERVICE
   Gestion Firestore pour le Blog
   ============================================ */

class CommunityFirebaseService {
    constructor() {
        this.db = firebase.firestore();
        this.storage = firebase.storage();
        this.auth = firebase.auth();
        
        // Collections
        this.postsCollection = this.db.collection('community_posts');
        this.commentsCollection = this.db.collection('community_comments');
        this.channelsCollection = this.db.collection('community_channels');
        this.usersCollection = this.db.collection('users');
        
        // Cache
        this.postsCache = new Map();
        this.channelsCache = null;
        
        console.log('✅ Community Firebase Service initialized');
    }

    // ============================================
    // CHANNELS MANAGEMENT
    // ============================================

    async initializeChannels() {
        try {
            const snapshot = await this.channelsCollection.get();
            
            if (snapshot.empty) {
                console.log('📝 Creating default channels...');
                await this.createDefaultChannels();
            }
            
            return await this.getChannels();
        } catch (error) {
            console.error('❌ Error initializing channels:', error);
            throw error;
        }
    }

    async createDefaultChannels() {
        const defaultChannels = [
            {
                id: 'market-analysis',
                name: 'Market Analysis',
                description: 'Technical & fundamental market analysis',
                icon: '📈',
                gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                subscriberCount: 0,
                postCount: 0
            },
            {
                id: 'ma-intelligence',
                name: 'M&A Intelligence',
                description: 'Mergers, acquisitions, and deal analysis',
                icon: '💼',
                gradient: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                subscriberCount: 0,
                postCount: 0
            },
            {
                id: 'trading-strategies',
                name: 'Trading Strategies',
                description: 'Quantitative strategies and backtests',
                icon: '🎯',
                gradient: 'linear-gradient(135deg, #10B981, #059669)',
                subscriberCount: 0,
                postCount: 0
            },
            {
                id: 'ipo-watch',
                name: 'IPO Watch',
                description: 'New IPOs and pre-IPO analysis',
                icon: '🚀',
                gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
                subscriberCount: 0,
                postCount: 0
            },
            {
                id: 'portfolio-reviews',
                name: 'Portfolio Reviews',
                description: 'Share portfolios and get feedback',
                icon: '📊',
                gradient: 'linear-gradient(135deg, #EC4899, #D946EF)',
                subscriberCount: 0,
                postCount: 0
            },
            {
                id: 'ai-quant',
                name: 'AI & Quant',
                description: 'Machine learning and quantitative models',
                icon: '🤖',
                gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)',
                subscriberCount: 0,
                postCount: 0
            },
            {
                id: 'ideas-insights',
                name: 'Ideas & Insights',
                description: 'Investment theses and opportunities',
                icon: '💡',
                gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                subscriberCount: 0,
                postCount: 0
            },
            {
                id: 'news-events',
                name: 'News & Events',
                description: 'Market news and upcoming events',
                icon: '📰',
                gradient: 'linear-gradient(135deg, #EF4444, #DC2626)',
                subscriberCount: 0,
                postCount: 0
            },
            {
                id: 'education',
                name: 'Education',
                description: 'Tutorials and learning resources',
                icon: '🎓',
                gradient: 'linear-gradient(135deg, #EAB308, #CA8A04)',
                subscriberCount: 0,
                postCount: 0
            },
            {
                id: 'success-stories',
                name: 'Success Stories',
                description: 'Winning trades and achievements',
                icon: '🏆',
                gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
                subscriberCount: 0,
                postCount: 0
            }
        ];

        const batch = this.db.batch();
        
        defaultChannels.forEach(channel => {
            const docRef = this.channelsCollection.doc(channel.id);
            batch.set(docRef, {
                ...channel,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });

        await batch.commit();
        console.log('✅ Default channels created');
    }

    async getChannels() {
        try {
            if (this.channelsCache) {
                return this.channelsCache;
            }

            const snapshot = await this.channelsCollection
                .orderBy('name', 'asc')
                .get();

            const channels = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            this.channelsCache = channels;
            return channels;
        } catch (error) {
            console.error('❌ Error fetching channels:', error);
            throw error;
        }
    }

    // ============================================
    // POSTS MANAGEMENT
    // ============================================

    async createPost(postData) {
        try {
            const currentUser = this.auth.currentUser;
            if (!currentUser) throw new Error('User not authenticated');

            // Get user data
            const userDoc = await this.usersCollection.doc(currentUser.uid).get();
            const userData = userDoc.data() || {};

            const post = {
                channelId: postData.channelId,
                authorId: currentUser.uid,
                authorName: userData.displayName || currentUser.email.split('@')[0],
                authorAvatar: userData.photoURL || null,  // ✅ Utilise photoURL de users
                authorPhoto: userData.photoURL || null,   // ✅ AJOUTER AUSSI pour compatibilité
                authorBadges: userData.badges || [],
                title: postData.title,
                content: postData.content,
                images: postData.images || [],
                tags: postData.tags || [],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                viewCount: 0,
                upvotes: 0,
                downvotes: 0,
                upvotedBy: [],
                downvotedBy: [],
                commentCount: 0,
                isPinned: false,
                isFeatured: false
            };

            const docRef = await this.postsCollection.add(post);

            // Update channel post count
            await this.channelsCollection.doc(postData.channelId).update({
                postCount: firebase.firestore.FieldValue.increment(1)
            });

            // Update user stats
            await this.usersCollection.doc(currentUser.uid).update({
                postCount: firebase.firestore.FieldValue.increment(1),
                reputation: firebase.firestore.FieldValue.increment(10)
            });

            console.log('✅ Post created:', docRef.id);
            return { id: docRef.id, ...post };
        } catch (error) {
            console.error('❌ Error creating post:', error);
            throw error;
        }
    }

    async getPosts(options = {}) {
        try {
            const {
                channelId = null,
                limit = 20,
                orderBy = 'createdAt',
                orderDirection = 'desc',
                lastDoc = null
            } = options;

            let query = this.postsCollection;

            // ✅ DEBUG : Vérifier le channelId
            console.log('🔍 Filtering posts by channelId:', channelId);

            if (channelId && channelId !== 'all') {
                query = query.where('channelId', '==', channelId);
                console.log('✅ Filter applied for channel:', channelId);
            }

            query = query.orderBy(orderBy, orderDirection);

            if (lastDoc) {
                query = query.startAfter(lastDoc);
            }

            query = query.limit(limit);

            const snapshot = await query.get();

            const posts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate(),
                _doc: doc
            }));

            return {
                posts,
                lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
                hasMore: snapshot.docs.length === limit
            };
        } catch (error) {
            console.error('❌ Error fetching posts:', error);
            throw error;
        }
    }

    async getPost(postId) {
        try {
            if (this.postsCache.has(postId)) {
                return this.postsCache.get(postId);
            }

            const doc = await this.postsCollection.doc(postId).get();

            if (!doc.exists) {
                throw new Error('Post not found');
            }

            const post = {
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate()
            };

            this.postsCache.set(postId, post);

            // Increment view count
            await this.postsCollection.doc(postId).update({
                viewCount: firebase.firestore.FieldValue.increment(1)
            });

            return post;
        } catch (error) {
            console.error('❌ Error fetching post:', error);
            throw error;
        }
    }

    async upvotePost(postId) {
        try {
            const currentUser = this.auth.currentUser;
            if (!currentUser) throw new Error('User not authenticated');

            const postRef = this.postsCollection.doc(postId);
            const postDoc = await postRef.get();
            const post = postDoc.data();

            const hasUpvoted = post.upvotedBy?.includes(currentUser.uid);
            const hasDownvoted = post.downvotedBy?.includes(currentUser.uid);

            const batch = this.db.batch();

            if (hasUpvoted) {
                // Remove upvote
                batch.update(postRef, {
                    upvotes: firebase.firestore.FieldValue.increment(-1),
                    upvotedBy: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
                });
            } else {
                // Add upvote
                batch.update(postRef, {
                    upvotes: firebase.firestore.FieldValue.increment(1),
                    upvotedBy: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
                });

                // Remove downvote if exists
                if (hasDownvoted) {
                    batch.update(postRef, {
                        downvotes: firebase.firestore.FieldValue.increment(-1),
                        downvotedBy: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
                    });
                }

                // Update author reputation
                batch.update(this.usersCollection.doc(post.authorId), {
                    reputation: firebase.firestore.FieldValue.increment(5)
                });
            }

            await batch.commit();
            this.postsCache.delete(postId);

            console.log('✅ Post upvoted');
        } catch (error) {
            console.error('❌ Error upvoting post:', error);
            throw error;
        }
    }

    async downvotePost(postId) {
        try {
            const currentUser = this.auth.currentUser;
            if (!currentUser) throw new Error('User not authenticated');

            const postRef = this.postsCollection.doc(postId);
            const postDoc = await postRef.get();
            const post = postDoc.data();

            const hasDownvoted = post.downvotedBy?.includes(currentUser.uid);
            const hasUpvoted = post.upvotedBy?.includes(currentUser.uid);

            const batch = this.db.batch();

            if (hasDownvoted) {
                // Remove downvote
                batch.update(postRef, {
                    downvotes: firebase.firestore.FieldValue.increment(-1),
                    downvotedBy: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
                });
            } else {
                // Add downvote
                batch.update(postRef, {
                    downvotes: firebase.firestore.FieldValue.increment(1),
                    downvotedBy: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
                });

                // Remove upvote if exists
                if (hasUpvoted) {
                    batch.update(postRef, {
                        upvotes: firebase.firestore.FieldValue.increment(-1),
                        upvotedBy: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
                    });
                }
            }

            await batch.commit();
            this.postsCache.delete(postId);

            console.log('✅ Post downvoted');
        } catch (error) {
            console.error('❌ Error downvoting post:', error);
            throw error;
        }
    }

    // ============================================
    // COMMENTS MANAGEMENT
    // ============================================

    async createComment(commentData) {
        try {
            const currentUser = this.auth.currentUser;
            if (!currentUser) throw new Error('User not authenticated');

            const userDoc = await this.usersCollection.doc(currentUser.uid).get();
            const userData = userDoc.data() || {};

            const comment = {
                postId: commentData.postId,
                authorId: currentUser.uid,
                authorName: userData.displayName || currentUser.email.split('@')[0],
                authorAvatar: userData.photoURL || null,
                content: commentData.content,
                parentCommentId: commentData.parentCommentId || null,
                upvotes: 0,
                upvotedBy: [],
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await this.commentsCollection.add(comment);

            // Update post comment count
            await this.postsCollection.doc(commentData.postId).update({
                commentCount: firebase.firestore.FieldValue.increment(1)
            });

            // Update user stats
            await this.usersCollection.doc(currentUser.uid).update({
                reputation: firebase.firestore.FieldValue.increment(2)
            });

            console.log('✅ Comment created:', docRef.id);
            return { id: docRef.id, ...comment };
        } catch (error) {
            console.error('❌ Error creating comment:', error);
            throw error;
        }
    }

    async getComments(postId) {
        try {
            const snapshot = await this.commentsCollection
                .where('postId', '==', postId)
                .orderBy('createdAt', 'asc')
                .get();

            const comments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate()
            }));

            // Organize comments into threads
            const commentMap = new Map();
            const rootComments = [];

            comments.forEach(comment => {
                comment.replies = [];
                commentMap.set(comment.id, comment);
            });

            comments.forEach(comment => {
                if (comment.parentCommentId) {
                    const parent = commentMap.get(comment.parentCommentId);
                    if (parent) {
                        parent.replies.push(comment);
                    }
                } else {
                    rootComments.push(comment);
                }
            });

            return rootComments;
        } catch (error) {
            console.error('❌ Error fetching comments:', error);
            throw error;
        }
    }

    async upvoteComment(commentId) {
        try {
            const currentUser = this.auth.currentUser;
            if (!currentUser) throw new Error('User not authenticated');

            const commentRef = this.commentsCollection.doc(commentId);
            const commentDoc = await commentRef.get();
            const comment = commentDoc.data();

            const hasUpvoted = comment.upvotedBy?.includes(currentUser.uid);

            if (hasUpvoted) {
                await commentRef.update({
                    upvotes: firebase.firestore.FieldValue.increment(-1),
                    upvotedBy: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
                });
            } else {
                await commentRef.update({
                    upvotes: firebase.firestore.FieldValue.increment(1),
                    upvotedBy: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
                });
            }

            console.log('✅ Comment upvoted');
        } catch (error) {
            console.error('❌ Error upvoting comment:', error);
            throw error;
        }
    }

    // ============================================
    // IMAGE UPLOAD
    // ============================================

    async uploadImage(file) {
        try {
            const currentUser = this.auth.currentUser;
            if (!currentUser) throw new Error('User not authenticated');

            const timestamp = Date.now();
            const fileName = `${currentUser.uid}/${timestamp}_${file.name}`;
            const storageRef = this.storage.ref(`community_images/${fileName}`);

            const snapshot = await storageRef.put(file);
            const downloadURL = await snapshot.ref.getDownloadURL();

            console.log('✅ Image uploaded:', downloadURL);
            return downloadURL;
        } catch (error) {
            console.error('❌ Error uploading image:', error);
            throw error;
        }
    }

    // ============================================
    // STATISTICS
    // ============================================

    async getCommunityStats() {
        try {
            const [postsSnapshot, usersSnapshot] = await Promise.all([
                this.postsCollection.get(),
                this.usersCollection.get()
            ]);

            const posts = postsSnapshot.docs.map(doc => doc.data());
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const postsToday = posts.filter(post => {
                const postDate = post.createdAt?.toDate();
                return postDate && postDate >= today;
            });

            return {
                totalPosts: postsSnapshot.size,
                totalMembers: usersSnapshot.size,
                postsToday: postsToday.length
            };
        } catch (error) {
            console.error('❌ Error fetching stats:', error);
            return { totalPosts: 0, totalMembers: 0, postsToday: 0 };
        }
    }

    async getTopContributors(limit = 5) {
        try {
            // Récupérer TOUS les utilisateurs (sans orderBy pour éviter l'index)
            const snapshot = await this.usersCollection.get();
            
            // Trier côté client
            const users = snapshot.docs
                .map(doc => ({
                    uid: doc.id,
                    ...doc.data(),
                    reputation: doc.data().reputation || 0
                }))
                .sort((a, b) => b.reputation - a.reputation)  // Tri descendant
                .slice(0, limit);  // Limiter aux N premiers
            
            return users;
        } catch (error) {
            console.error('❌ Error fetching top contributors:', error);
            return [];
        }
    }

    async getFeaturedPosts(limit = 3) {
        try {
            const snapshot = await this.postsCollection
                .where('isFeatured', '==', true)
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate()
            }));
        } catch (error) {
            console.error('❌ Error fetching featured posts:', error);
            return [];
        }
    }

    async getTrendingTags(limit = 10) {
        try {
            const snapshot = await this.postsCollection
                .orderBy('createdAt', 'desc')
                .limit(100)
                .get();

            const tagCount = new Map();

            snapshot.docs.forEach(doc => {
                const tags = doc.data().tags || [];
                tags.forEach(tag => {
                    tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
                });
            });

            const sortedTags = Array.from(tagCount.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, limit)
                .map(([tag, count]) => ({ tag, count }));

            return sortedTags;
        } catch (error) {
            console.error('❌ Error fetching trending tags:', error);
            return [];
        }
    }
}

// Global instance
window.communityService = new CommunityFirebaseService();