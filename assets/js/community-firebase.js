/* ============================================
   ALPHAVAULT AI - COMMUNITY FIREBASE SERVICE
   Version complète avec toutes les méthodes
   ============================================ */

class CommunityFirebaseService {
    constructor() {
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        
        // ⚠ REMPLACE PAR L'URL DE TON WORKER IMAGE STORAGE
        // this.imageWorkerUrl = 'https://alphavault-image-storage.raphnardone.workers.dev';
        this.imageWorkerUrl = 'https://images-api.alphavault-ai.com';
    }

    /* ==========================================
       📤 UPLOAD D'IMAGE VERS CLOUDFLARE R2
       ========================================== */
    
    async uploadImage(file) {
        try {
            console.log('📤 Starting image upload...');

            const MAX_SIZE = 5 * 1024 * 1024;
            if (file.size > MAX_SIZE) {
                throw new Error(`Image too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max: 5MB`);
            }

            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                throw new Error(`Invalid file type: ${file.type}`);
            }

            const user = this.auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const optimizedBlob = await this.optimizeImage(file);

            const formData = new FormData();
            formData.append('image', optimizedBlob, file.name);
            formData.append('userId', user.uid);

            const token = await user.getIdToken();

            console.log('🚀 Uploading to Cloudflare R2...');

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
            console.log('✅ Image uploaded:', result.imageUrl);
            return result.imageUrl;

        } catch (error) {
            console.error('❌ Error uploading image:', error);
            throw error;
        }
    }

    async optimizeImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    const MAX_WIDTH = 1600;
                    const MAX_HEIGHT = 1600;
                    
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
                        width = Math.floor(width * ratio);
                        height = Math.floor(height * ratio);
                    }
                    
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, width, height);
                    
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
                    }, 'image/jpeg', 0.85);
                };
                
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    async deleteImage(imageUrl) {
        try {
            const user = this.auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const urlParts = imageUrl.split('/images/');
            if (urlParts.length !== 2) {
                console.warn('⚠ Invalid image URL format:', imageUrl);
                return;
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
                return;
            }

            const result = await response.json();
            console.log('✅ Image deleted:', result.message);

        } catch (error) {
            console.error('❌ Error deleting image:', error);
        }
    }

    /* ==========================================
       📂 GESTION DES CHANNELS
       ========================================== */
    
    async getChannels() {
        try {
            console.log('📂 Loading channels...');
            
            // ✅ Récupérer les channels depuis Firestore
            const channelsSnapshot = await firebase.firestore()
                .collection('channels')
                .orderBy('order', 'asc')
                .get();

            if (channelsSnapshot.empty) {
                console.warn('⚠ No channels found in Firestore collection "channels"');
                console.warn('💡 Creating default channels...');
                
                // Créer des channels par défaut si la collection est vide
                await this.createDefaultChannels();
                
                // Rappeler la fonction récursivement
                return this.getChannels();
            }

            const channels = channelsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                postCount: 0 // Valeur par défaut
            }));

            console.log(`✅ ${channels.length} channels loaded`);

            // ✅ CORRECTION CRITIQUE : Calculer le nombre de posts pour chaque channel
            console.log('🔢 Calculating post counts...');
            
            for (const channel of channels) {
                try {
                    // Requête pour compter les posts de ce channel
                    const postsSnapshot = await firebase.firestore()
                        .collection('posts')
                        .where('channelId', '==', channel.id)
                        .get();

                    channel.postCount = postsSnapshot.size;
                    
                    console.log(`   📊 Channel "${channel.name}" (${channel.id}): ${postsSnapshot.size} posts`);
                    
                    // ✅ DEBUG : Afficher les posts trouvés
                    if (postsSnapshot.size > 0) {
                        console.log(`      Posts found:`, postsSnapshot.docs.map(doc => ({
                            id: doc.id,
                            title: doc.data().title,
                            channelId: doc.data().channelId
                        })));
                    }
                    
                } catch (countError) {
                    console.error(`   ❌ Error counting posts for channel "${channel.id}":`, countError);
                    console.error(`      Error details:`, {
                        code: countError.code,
                        message: countError.message
                    });
                    
                    // ⚠ Si erreur d'index manquant
                    if (countError.code === 'failed-precondition') {
                        console.error('      🔗 Index required! Check console for link to create it.');
                    }
                    
                    channel.postCount = 0;
                }
            }

            console.log('✅ Post counts calculated:', channels.map(c => ({
                id: c.id,
                name: c.name,
                postCount: c.postCount
            })));

            return channels;

        } catch (error) {
            console.error('❌ Error loading channels:', error);
            
            // Retourner des channels par défaut en cas d'erreur fatale
            return this.getDefaultChannels();
        }
    }

    // ✅ Méthode pour créer les channels par défaut dans Firestore
    async createDefaultChannels() {
        const defaultChannels = [
            { id: 'market-analysis', name: 'Market Analysis', icon: '📊', order: 1, description: 'Market trends and analysis' },
            { id: 'trading-strategies', name: 'Trading Strategies', icon: '📈', order: 2, description: 'Trading techniques and strategies' },
            { id: 'ai-quant', name: 'AI & Quant', icon: '🤖', order: 3, description: 'AI and quantitative finance' },
            { id: 'ipo-watch', name: 'IPO Watch', icon: '🚀', order: 4, description: 'IPO analysis and tracking' },
            { id: 'ma-intelligence', name: 'M&A Intelligence', icon: '🤝', order: 5, description: 'Mergers and acquisitions insights' },
            { id: 'portfolio-reviews', name: 'Portfolio Reviews', icon: '💼', order: 6, description: 'Portfolio analysis and reviews' },
            { id: 'ideas-insights', name: 'Ideas & Insights', icon: '💡', order: 7, description: 'Investment ideas and insights' },
            { id: 'news-events', name: 'News & Events', icon: '📰', order: 8, description: 'Market news and events' },
            { id: 'education', name: 'Education', icon: '📚', order: 9, description: 'Educational resources' },
            { id: 'success-stories', name: 'Success Stories', icon: '🏆', order: 10, description: 'Community success stories' }
        ];

        const batch = firebase.firestore().batch();

        defaultChannels.forEach(channel => {
            const channelRef = firebase.firestore().collection('channels').doc(channel.id);
            batch.set(channelRef, {
                name: channel.name,
                icon: channel.icon,
                order: channel.order,
                description: channel.description,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });

        await batch.commit();
        console.log('✅ Default channels created in Firestore');
    }

    // ✅ Méthode pour retourner des channels statiques (fallback)
    getDefaultChannels() {
        return [
            { id: 'market-analysis', name: 'Market Analysis', icon: '📊', order: 1, postCount: 0 },
            { id: 'trading-strategies', name: 'Trading Strategies', icon: '📈', order: 2, postCount: 0 },
            { id: 'ai-quant', name: 'AI & Quant', icon: '🤖', order: 3, postCount: 0 },
            { id: 'ipo-watch', name: 'IPO Watch', icon: '🚀', order: 4, postCount: 0 },
            { id: 'ma-intelligence', name: 'M&A Intelligence', icon: '🤝', order: 5, postCount: 0 },
            { id: 'portfolio-reviews', name: 'Portfolio Reviews', icon: '💼', order: 6, postCount: 0 },
            { id: 'ideas-insights', name: 'Ideas & Insights', icon: '💡', order: 7, postCount: 0 },
            { id: 'news-events', name: 'News & Events', icon: '📰', order: 8, postCount: 0 },
            { id: 'education', name: 'Education', icon: '📚', order: 9, postCount: 0 },
            { id: 'success-stories', name: 'Success Stories', icon: '🏆', order: 10, postCount: 0 }
        ];
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
                images: postData.images || [],
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

            // ✅ Recalculer les points de l'auteur
            await this.recalculateUserPoints(user.uid);

            // ✅ 📧 NOUVEAU : Envoyer les notifications par email
            await this.sendBlogPostNotification(post, docRef.id);

            return {
                id: docRef.id,
                ...post
            };

        } catch (error) {
            console.error('❌ Error creating post:', error);
            throw error;
        }
    }

    /* ==========================================
    📧 NOTIFICATION EMAIL - VERSION CORRIGÉE
    ========================================== */

    /**
     * Récupère TOUS les utilisateurs avec pagination automatique
     * @returns {Promise<Array>} Liste complète des utilisateurs
     */
    async getAllUsersWithPagination() {
        const BATCH_SIZE = 500; // Limite Firestore
        let allUsers = [];
        let lastDoc = null;
        let hasMore = true;
        let batchCount = 0;

        console.log('📊 Starting user retrieval with pagination...');

        try {
            while (hasMore) {
                batchCount++;
                console.log(`📦 Fetching batch ${batchCount}...`);

                // Construire la requête
                let query = this.db.collection('users').limit(BATCH_SIZE);

                // Continuer après le dernier document
                if (lastDoc) {
                    query = query.startAfter(lastDoc);
                }

                const snapshot = await query.get();

                // Si vide, on a terminé
                if (snapshot.empty) {
                    console.log('✅ No more users to fetch');
                    hasMore = false;
                    break;
                }

                // Ajouter les utilisateurs récupérés
                snapshot.docs.forEach(doc => {
                    const userData = doc.data();
                    if (userData.email && userData.email.trim() !== '') {
                        allUsers.push({
                            uid: doc.id,
                            email: userData.email,
                            name: userData.displayName || 'Member',
                            plan: userData.plan || 'free'
                        });
                    }
                });

                // Sauvegarder le dernier document pour pagination
                lastDoc = snapshot.docs[snapshot.docs.length - 1];

                // Si moins de BATCH_SIZE, c'est la dernière page
                if (snapshot.docs.length < BATCH_SIZE) {
                    hasMore = false;
                }

                console.log(`✅ Batch ${batchCount}: ${snapshot.docs.length} users | Total: ${allUsers.length}`);
            }

            console.log(`🎉 TOTAL USERS RETRIEVED: ${allUsers.length}`);
            return allUsers;

        } catch (error) {
            console.error('❌ Error fetching users with pagination:', error);
            throw error;
        }
    }

    /**
     * 📧 Envoyer une notification email à tous les utilisateurs lors d'une publication
     * ✅ VERSION FINALE CORRIGÉE AVEC PAGINATION
     */
    async sendBlogPostNotification(postData, postId) {
        try {
            console.log('📧 Starting blog post notification process...');
            console.log('📄 Post:', postData.title);

            // ✅ CORRECTION : Récupérer TOUS les utilisateurs avec pagination
            const allUsers = await this.getAllUsersWithPagination();

            if (allUsers.length === 0) {
                console.warn('⚠ No users found to notify');
                return { success: false, sent: 0, failed: 0 };
            }

            // ✅ Filtrer : exclure l'auteur du post
            const recipients = allUsers
                .filter(user => user.uid !== postData.authorId)
                .map(user => ({
                    email: user.email,
                    name: user.name
                }));

            if (recipients.length === 0) {
                console.warn('⚠ No recipients after filtering (author excluded)');
                return { success: false, sent: 0, failed: 0 };
            }

            console.log(`📤 Sending emails to ${recipients.length} users...`);
            console.log(`   (${allUsers.length} total users - ${allUsers.length - recipients.length} filtered out)`);

            // ✅ Récupérer les infos du channel
            let channelName = 'Community';
            let channelIcon = '📰';
            
            if (postData.channelId) {
                try {
                    const channelDoc = await this.db.collection('channels').doc(postData.channelId).get();
                    if (channelDoc.exists) {
                        const channelData = channelDoc.data();
                        channelName = channelData.name || channelName;
                        channelIcon = channelData.icon || channelIcon;
                    }
                } catch (channelError) {
                    console.warn('⚠ Could not fetch channel info:', channelError);
                }
            }

            // ✅ Préparer les données pour le worker
            const notificationData = {
                recipients: recipients,
                postTitle: postData.title,
                postAuthor: postData.authorName,
                postAuthorPhoto: postData.authorPhoto,
                channelName: channelName,
                channelIcon: channelIcon,
                postPreview: postData.content ? postData.content.substring(0, 200) : '',
                postImage: postData.images && postData.images.length > 0 ? postData.images[0] : null,
                postId: postId
            };

            // ✅ Appeler le worker
            const WORKER_URL = 'https://message-notification-sender.raphnardone.workers.dev/send-blog-post';
            
            console.log('📡 Calling notification worker:', WORKER_URL);
            console.log(`📊 Payload: ${recipients.length} recipients`);
            
            const response = await fetch(WORKER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(notificationData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Worker response error:', errorText);
                throw new Error(`Worker error (${response.status}): ${errorText}`);
            }

            const result = await response.json();
            
            console.log('✅ Blog post notifications sent successfully!');
            console.log(`   📧 Sent: ${result.successCount || 0}`);
            console.log(`   ❌ Failed: ${result.failCount || 0}`);
            
            return {
                success: true,
                sent: result.successCount || 0,
                failed: result.failCount || 0,
                total: result.total || recipients.length
            };

        } catch (error) {
            console.error('❌ Error sending blog post notifications:', error);
            console.error('📋 Error details:', {
                message: error.message,
                stack: error.stack
            });
            
            // Ne pas bloquer la création du post en cas d'erreur d'email
            return {
                success: false,
                sent: 0,
                failed: 0,
                error: error.message
            };
        }
    }

    /* ==========================================
    🧪 DEBUG - COMPTER LES UTILISATEURS
    ========================================== */

    /**
     * Compter le nombre total d'utilisateurs (pour debug)
     */
    async debugCountAllUsers() {
        try {
            console.log('🔢 Counting all users in Firestore...');
            
            const allUsers = await this.getAllUsersWithPagination();
            
            console.log('📊 USER COUNT REPORT:');
            console.log(`   👥 Total users: ${allUsers.length}`);
            console.log(`   📧 With email: ${allUsers.filter(u => u.email).length}`);
            console.log(`   ❌ Without email: ${allUsers.filter(u => !u.email).length}`);
            
            // Afficher les 10 premiers
            console.log('📋 First 10 users:', allUsers.slice(0, 10));
            
            return allUsers.length;
            
        } catch (error) {
            console.error('❌ Error counting users:', error);
            return 0;
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

            if (postData.images && postData.images.length > 0) {
                for (const imageUrl of postData.images) {
                    await this.deleteImage(imageUrl);
                }
            }

            await this.db.collection('posts').doc(postId).delete();
            // ✅ AJOUT : Recalculer les points de l'auteur
            await this.recalculateUserPoints(user.uid);
            
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

            const posts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            console.log(`✅ Posts loaded: ${posts.length}`);
            
            return posts;

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

            console.log('❤ Toggling like for post:', postId);
            console.log('👤 User:', user.uid, user.email);

            const postRef = this.db.collection('posts').doc(postId);
            const postDoc = await postRef.get();
            
            if (!postDoc.exists) throw new Error('Post not found');

            const postData = postDoc.data();
            const likes = postData.likes || [];
            const hasLiked = likes.includes(user.uid);

            console.log('📊 Current likes:', likes.length, '| Is liked:', hasLiked);

            if (hasLiked) {
                // ❌ UNLIKE
                console.log('💔 Unliking post...');
                
                // 1. Retirer du tableau likes du post
                await postRef.update({
                    likes: firebase.firestore.FieldValue.arrayRemove(user.uid)
                });
                console.log('   ✓ Removed from post.likes array');

                // 2. ✅ NOUVEAU : Supprimer de la sous-collection likedPosts
                const likedPostRef = this.db
                    .collection('users')
                    .doc(user.uid)
                    .collection('likedPosts')
                    .doc(postId);
                
                console.log('   🗑 Deleting from:', likedPostRef.path);
                
                await likedPostRef.delete();
                console.log('   ✓ Deleted from likedPosts subcollection');

                console.log('✅ Post unliked successfully');
                
                return { liked: false, count: likes.length - 1 };
                
            } else {
                // ✅ LIKE
                console.log('❤ Liking post...');
                
                // 1. Ajouter au tableau likes du post
                await postRef.update({
                    likes: firebase.firestore.FieldValue.arrayUnion(user.uid)
                });
                console.log('   ✓ Added to post.likes array');

                // 2. ✅ NOUVEAU : Ajouter à la sous-collection likedPosts
                const likedPostRef = this.db
                    .collection('users')
                    .doc(user.uid)
                    .collection('likedPosts')
                    .doc(postId);
                
                const likedPostData = {
                    likedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    postId: postId,
                    postTitle: postData.title || '',
                    postAuthor: postData.authorName || '',
                    channelId: postData.channelId || ''
                };
                
                console.log('   💾 Saving to:', likedPostRef.path);
                console.log('   📄 Data:', likedPostData);
                
                await likedPostRef.set(likedPostData);
                console.log('   ✓ Saved to likedPosts subcollection');

                // 3. Vérifier que ça a bien été sauvegardé
                const verifyDoc = await likedPostRef.get();
                console.log('   🔍 Verification:', verifyDoc.exists ? '✅ EXISTS' : '❌ NOT FOUND');
                if (verifyDoc.exists) {
                    console.log('   📄 Saved data:', verifyDoc.data());
                }

                // 4. Recalculer les points de l'auteur du post
                await this.recalculateUserPoints(postData.authorId);
                
                console.log('✅ Post liked successfully');
                
                return { liked: true, count: likes.length + 1 };
            }

        } catch (error) {
            console.error('❌ Error toggling like:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            throw error;
        }
    }

    /* ==========================================
       🌟 POSTS EN VEDETTE (Featured)
       ========================================== */
    
    async getFeaturedPosts(limit = 5) {
        try {
            const snapshot = await this.db.collection('posts')
                .orderBy('views', 'desc')
                .limit(limit)
                .get();

            const posts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            console.log(`✅ Featured posts loaded: ${posts.length}`);
            
            return posts;

        } catch (error) {
            console.error('❌ Error getting featured posts:', error);
            return []; // Retourner un tableau vide au lieu de throw
        }
    }

    /* ==========================================
       📊 STATISTIQUES COMMUNAUTÉ
       ========================================== */
    
    async getCommunityStats() {
        try {
            // Compter les posts
            const postsSnapshot = await this.db.collection('posts').get();
            const totalPosts = postsSnapshot.size;

            // Compter les utilisateurs
            const usersSnapshot = await this.db.collection('users').get();
            const totalMembers = usersSnapshot.size;

            // Compter les commentaires
            const commentsSnapshot = await this.db.collection('comments').get();
            const totalComments = commentsSnapshot.size;

            // Calculer les posts actifs (dernières 24h)
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);
            
            const activePostsSnapshot = await this.db.collection('posts')
                .where('createdAt', '>', firebase.firestore.Timestamp.fromDate(oneDayAgo))
                .get();
            const activePosts = activePostsSnapshot.size;

            const stats = {
                totalPosts,
                totalMembers,
                totalComments,
                activePosts
            };

            console.log('✅ Community stats loaded:', stats);
            
            return stats;

        } catch (error) {
            console.error('❌ Error getting community stats:', error);
            return {
                totalPosts: 0,
                totalMembers: 0,
                totalComments: 0,
                activePosts: 0
            };
        }
    }

    /* ==========================================
       🏷 TAGS POPULAIRES
       ========================================== */
    
    async getPopularTags(limit = 10) {
        try {
            const snapshot = await this.db.collection('posts').get();
            
            const tagCounts = {};
            
            snapshot.docs.forEach(doc => {
                const post = doc.data();
                if (post.tags && Array.isArray(post.tags)) {
                    post.tags.forEach(tag => {
                        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                    });
                }
            });

            const sortedTags = Object.entries(tagCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, limit)
                .map(([tag, count]) => ({ tag, count }));

            console.log(`✅ Popular tags loaded: ${sortedTags.length}`);
            
            return sortedTags;

        } catch (error) {
            console.error('❌ Error getting popular tags:', error);
            return [];
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
            // ✅ AJOUT : Recalculer les points de l'auteur du commentaire
            await this.recalculateUserPoints(user.uid);

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
            
            // ✅ AJOUT : Recalculer les points de l'auteur du commentaire
            await this.recalculateUserPoints(user.uid);

            console.log('✅ Comment deleted:', commentId);

        } catch (error) {
            console.error('❌ Error deleting comment:', error);
            throw error;
        }
    }

    /* ==========================================
    🏆 LEADERBOARD - TOP CONTRIBUTEURS
    ========================================== */

    /**
     * Récupérer les top contributeurs (triés par points)
     */
    async getTopContributors(limit = 5) {
        try {
            const snapshot = await this.db.collection('users')
                .orderBy('points', 'desc') // ✅ Nécessite un index
                .limit(limit)
                .get();

            if (snapshot.empty) {
                console.warn('⚠ No users found in leaderboard');
                return [];
            }

            const topUsers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            console.log('✅ Top contributors loaded:', topUsers.length);
            return topUsers;

        } catch (error) {
            console.error('❌ Error fetching top contributors:', error);
            
            // Si l'erreur est due à un index manquant
            if (error.code === 'failed-precondition') {
                console.error('🔥 MISSING INDEX! Create index for: users.points (desc)');
                console.error('📝 Index URL:', error.message.match(/https:\/\/[^\s]+/)?.[0]);
            }
            
            return [];
        }
    }

    /**
     * Recalculer les points d'un utilisateur
     * À appeler après création/suppression de post, like, commentaire
     */
    async recalculateUserPoints(userId) {
        try {
            const userRef = this.db.collection('users').doc(userId);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                console.warn('⚠ User not found:', userId);
                return 0;
            }

            // 📊 Compter les posts de l'utilisateur
            const postsSnapshot = await this.db.collection('posts')
                .where('authorId', '==', userId)
                .get();

            // 💖 Compter les likes reçus sur tous ses posts
            let totalLikes = 0;
            postsSnapshot.docs.forEach(doc => {
                const post = doc.data();
                totalLikes += (post.likes?.length || 0);
            });

            // 💬 Compter les commentaires de l'utilisateur
            const commentsSnapshot = await this.db.collection('comments')
                .where('authorId', '==', userId)
                .get();

            // 🏆 FORMULE DE SCORING (ajustez selon vos besoins)
            const points = 
                (postsSnapshot.size * 10) +      // 10 points par post créé
                (totalLikes * 2) +               // 2 points par like reçu
                (commentsSnapshot.size * 3);     // 3 points par commentaire

            // 💾 Mettre à jour les stats de l'utilisateur
            await userRef.update({
                points: points,
                postsCount: postsSnapshot.size,
                commentsCount: commentsSnapshot.size,
                likesReceived: totalLikes,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log(`✅ Points recalculated for ${userId}: ${points} points`);
            return points;

        } catch (error) {
            console.error('❌ Error recalculating points:', error);
            throw error;
        }
    }

    /**
     * Initialiser les points d'un nouvel utilisateur
     */
    async initializeUserPoints(userId, userData = {}) {
        try {
            const userRef = this.db.collection('users').doc(userId);
            
            await userRef.set({
                displayName: userData.displayName || 'Anonymous',
                photoURL: userData.photoURL || null,
                email: userData.email || null,
                plan: userData.plan || 'free',
                points: 0,
                postsCount: 0,
                commentsCount: 0,
                likesReceived: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true }); // merge: true pour ne pas écraser les données existantes

            console.log('✅ User points initialized:', userId);

        } catch (error) {
            console.error('❌ Error initializing user points:', error);
            throw error;
        }
    }

    /* ==========================================
       👥 RÉCUPÉRATION DE TOUS LES UTILISATEURS (Pour Modal de Partage)
       ========================================== */

    /**
     * Récupérer tous les utilisateurs pour la modal de partage de post
     * @param {number} limit - Nombre maximum d'utilisateurs à retourner
     * @returns {Promise<Array>} Liste des utilisateurs
     */
    async getAllUsers(limit = 50) {
        try {
            console.log(`📥 Fetching all users (limit: ${limit})...`);
            
            const snapshot = await this.db
                .collection('users')
                .orderBy('displayName', 'asc') // Tri alphabétique
                .limit(limit)
                .get();

            if (snapshot.empty) {
                console.warn('⚠ No users found');
                return [];
            }

            const users = snapshot.docs
                .map(doc => ({
                    uid: doc.id,
                    ...doc.data()
                }))
                .filter(user => user.uid !== this.auth.currentUser?.uid); // Exclure l'utilisateur actuel

            console.log(`✅ ${users.length} users loaded`);
            return users;

        } catch (error) {
            console.error('❌ Error fetching all users:', error);
            return [];
        }
    }

    /**
     * Recherche d'utilisateurs avec filtrage avancé (pour modal de partage)
     * @param {string} query - Requête de recherche
     * @param {number} limit - Nombre maximum de résultats
     * @returns {Promise<Array>} Liste des utilisateurs correspondants
     */
    async searchUsersForShare(query, limit = 20) {
        try {
            if (!query || query.trim().length < 2) {
                // Si pas de recherche, retourner tous les utilisateurs
                return await this.getAllUsers(limit);
            }

            const queryLower = query.toLowerCase().trim();
            console.log(`🔍 Searching users for: "${queryLower}"`);

            // Recherche par email
            const emailQuery = this.db
                .collection('users')
                .where('email', '>=', queryLower)
                .where('email', '<=', queryLower + '\uf8ff')
                .limit(limit)
                .get();

            // Recherche par displayName
            const nameQuery = this.db
                .collection('users')
                .where('displayName', '>=', query)
                .where('displayName', '<=', query + '\uf8ff')
                .limit(limit)
                .get();

            const [emailSnapshot, nameSnapshot] = await Promise.all([emailQuery, nameQuery]);

            // Combiner et dédupliquer les résultats
            const usersMap = new Map();

            emailSnapshot.docs.forEach(doc => {
                if (doc.id !== this.auth.currentUser?.uid) {
                    usersMap.set(doc.id, { uid: doc.id, ...doc.data() });
                }
            });

            nameSnapshot.docs.forEach(doc => {
                if (doc.id !== this.auth.currentUser?.uid) {
                    usersMap.set(doc.id, { uid: doc.id, ...doc.data() });
                }
            });

            const users = Array.from(usersMap.values());
            console.log(`✅ Found ${users.length} matching users`);
            
            return users;

        } catch (error) {
            console.error('❌ Error searching users for share:', error);
            return [];
        }
    }
}

// Initialiser le service
window.communityService = new CommunityFirebaseService();
console.log('✅ Community Service initialized with Cloudflare R2 Image Storage');